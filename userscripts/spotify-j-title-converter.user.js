// ==UserScript==
// @name         Spotify - Send to J-Title Converter
// @namespace    https://github.com/ttarner/j-title-converter
// @version      1.2.0
// @description  Adds a J-Title Converter action to Spotify track context menus.
// @match        https://open.spotify.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const CONVERTER_URL = 'https://ttarner.github.io/j-title-converter/';
  const ACTION_ID = 'j-title-converter-spotify-action';
  const ACTION_LABEL = 'Send to J-Title Converter';
  let lastTrackUrl = '';

  function normalizeTrackUrl(value) {
    if (!value) return '';

    try {
      if (value.startsWith('spotify:track:')) {
        return `https://open.spotify.com/track/${value.slice('spotify:track:'.length)}`;
      }

      const url = new URL(value, window.location.origin);
      return url.pathname.includes('/track/') ? url.href : '';
    } catch {
      return '';
    }
  }

  function getTrackUrl(element) {
    if (!element) return '';

    const directUrl = normalizeTrackUrl(element.href || element.getAttribute?.('data-uri'));
    if (directUrl) return directUrl;

    const containers = [
      element,
      element.closest?.('[data-testid="tracklist-row"]'),
      element.closest?.('[role="row"]'),
      element.closest?.('[data-testid*="track"]'),
    ].filter(Boolean);

    for (const container of containers) {
      const link = container.closest?.('a[href*="/track/"]') || container.querySelector?.('a[href*="/track/"]');
      const href = normalizeTrackUrl(link?.href);
      if (href) return href;

      const uriElement = container.matches?.('[data-uri*="spotify:track:"]')
        ? container
        : container.querySelector?.('[data-uri*="spotify:track:"]');
      const uri = normalizeTrackUrl(uriElement?.getAttribute('data-uri'));
      if (uri) return uri;
    }

    return '';
  }

  function rememberTrackFromEvent(event) {
    const target = event.target instanceof Element ? event.target : null;
    const trackUrl = getTrackUrl(target);
    if (trackUrl) lastTrackUrl = trackUrl;
  }

  function getCurrentTrackUrl() {
    const rememberedUrl = lastTrackUrl;
    if (rememberedUrl) return rememberedUrl;

    const currentTrack = document.querySelector('[aria-current="true"][href*="/track/"], [data-testid="context-item-link"][href*="/track/"]');
    const currentTrackUrl = getTrackUrl(currentTrack);
    if (currentTrackUrl) return currentTrackUrl;

    const nowPlayingUrl = getTrackUrl(document.querySelector('[data-testid="now-playing-widget"]'));
    if (nowPlayingUrl) return nowPlayingUrl;

    const trackLinks = document.querySelectorAll('a[href*="/track/"], [data-uri*="spotify:track:"]');
    if (trackLinks.length === 1) {
      const onlyTrack = trackLinks[0];
      const trackUrl = normalizeTrackUrl(onlyTrack.href || onlyTrack.getAttribute('data-uri'));
      if (trackUrl) return trackUrl;
    }

    return normalizeTrackUrl(window.location.href);
  }

  function waitForMenuItem(label) {
    return new Promise((resolve) => {
      const findItem = () => Array.from(document.querySelectorAll('[role="menuitem"]')).find((item) => {
        return item.textContent?.trim().toLowerCase().includes(label);
      });
      const existingItem = findItem();
      if (existingItem) {
        resolve(existingItem);
        return;
      }

      const observer = new MutationObserver(() => {
        const item = findItem();
        if (!item) return;
        observer.disconnect();
        resolve(item);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 1000);
    });
  }

  async function getUrlFromShareMenu(shareItem) {
    shareItem.click();
    const copyItem = await waitForMenuItem('copy link to song');
    if (!copyItem) return '';

    let copiedText = '';
    const clipboard = navigator.clipboard;
    const originalWriteText = clipboard?.writeText;
    if (clipboard && originalWriteText) {
      try {
        Object.defineProperty(clipboard, 'writeText', {
          configurable: true,
          value: (text) => {
            copiedText = text;
            return originalWriteText.call(clipboard, text);
          },
        });
      } catch {
      }
    }

    copyItem.click();
    await new Promise((resolve) => window.setTimeout(resolve, 100));

    if (clipboard && originalWriteText) {
      try {
        Object.defineProperty(clipboard, 'writeText', {
          configurable: true,
          value: originalWriteText,
        });
      } catch {
      }
    }

    const interceptedUrl = normalizeTrackUrl(copiedText);
    if (interceptedUrl) return interceptedUrl;

    try {
      return normalizeTrackUrl(await navigator.clipboard.readText());
    } catch {
      return '';
    }
  }

  async function openConverter(menu, shareItem) {
    const pendingTab = shareItem ? window.open('', '_blank') : null;
    let trackUrl = shareItem ? await getUrlFromShareMenu(shareItem) : '';
    if (!trackUrl) trackUrl = getCurrentTrackUrl();

    if (!trackUrl) {
      pendingTab?.close();
      window.alert('Open a track menu or start playing a track before sending it to J-Title Converter.');
      return;
    }

    const destination = new URL(CONVERTER_URL);
    destination.searchParams.set('q', trackUrl);
    if (pendingTab) {
      pendingTab.location.href = destination.href;
    } else {
      window.open(destination.href, '_blank', 'noopener,noreferrer');
    }
  }

  function createAction(menu, shareItem) {
    const action = shareItem.cloneNode(true);
    action.id = ACTION_ID;
    action.setAttribute('aria-label', ACTION_LABEL);
    action.removeAttribute('aria-haspopup');

    action.querySelectorAll('[aria-haspopup], [data-testid*="submenu"], [data-testid*="arrow"]').forEach((element) => {
      element.remove();
    });

    const icons = action.querySelectorAll('svg');
    icons.forEach((icon, index) => {
      if (index > 0) icon.remove();
    });

    const label = action.querySelector('[dir="auto"], span');
    if (label) label.textContent = ACTION_LABEL;
    else action.textContent = ACTION_LABEL;

    action.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openConverter(menu, shareItem);
    });

    action.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openConverter(menu, shareItem);
    });

    return action;
  }

  function injectAction(menu) {
    if (menu.querySelector(`#${ACTION_ID}`)) return;

    const shareItem = Array.from(menu.querySelectorAll('[role="menuitem"]')).find((item) => {
      return item.textContent?.trim().toLowerCase() === 'share';
    });
    if (!shareItem) return;

    shareItem.insertAdjacentElement('beforebegin', createAction(menu, shareItem));
  }

  function scanMenus(root = document) {
    if (!(root instanceof Element || root instanceof Document)) return;

    const menus = root.matches?.('[role="menu"]') ? [root] : root.querySelectorAll('[role="menu"]');
    menus.forEach(injectAction);
  }

  document.addEventListener('contextmenu', rememberTrackFromEvent, true);
  document.addEventListener('pointerdown', rememberTrackFromEvent, true);
  document.addEventListener('click', rememberTrackFromEvent, true);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) scanMenus(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanMenus();
})();