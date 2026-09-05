import { AnimeSoundtrackInfo } from '../src/types';

// Curated catalog of well-known anime themes for instant resolution & fallback
const POPULAR_ANIME_THEMES: Array<{
  keywords: string[];
  artistKeywords?: string[];
  anime: string;
  animeWesternTitle?: string;
  animeJapaneseTitle?: string;
  myAnimeListUrl?: string;
  crunchyrollUrl?: string;
  themeType: 'Opening' | 'Ending' | 'Insert' | 'Theme Song';
  themeName: string;
  slug: string;
  year: number;
  season?: string;
}> = [
  {
    keywords: ['残響散歌', 'zankyou sanka', 'zankyosanka', 'zankyou zanka'],
    artistKeywords: ['aimer'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Entertainment District Arc',
    animeWesternTitle: 'Demon Slayer: Kimetsu no Yaiba – Entertainment District Arc',
    myAnimeListUrl: 'https://myanimelist.net/anime/47778',
    crunchyrollUrl: 'https://www.crunchyroll.com/demon-slayer-kimetsu-no-yaiba',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2022,
    season: 'Winter',
  },
  {
    keywords: ['朝が来る', 'asa ga kuru'],
    artistKeywords: ['aimer'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Entertainment District Arc',
    animeWesternTitle: 'Demon Slayer: Kimetsu no Yaiba – Entertainment District Arc',
    myAnimeListUrl: 'https://myanimelist.net/anime/47778',
    crunchyrollUrl: 'https://www.crunchyroll.com/demon-slayer-kimetsu-no-yaiba',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2022,
    season: 'Winter',
  },
  {
    keywords: ['紅蓮華', 'gurenge'],
    artistKeywords: ['lisa'],
    anime: 'Demon Slayer: Kimetsu no Yaiba',
    animeWesternTitle: 'Demon Slayer: Kimetsu no Yaiba',
    myAnimeListUrl: 'https://myanimelist.net/anime/38000',
    crunchyrollUrl: 'https://www.crunchyroll.com/demon-slayer-kimetsu-no-yaiba',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2019,
    season: 'Spring',
  },
  {
    keywords: ['from the edge'],
    artistKeywords: ['fictionjunction', 'lisa'],
    anime: 'Demon Slayer: Kimetsu no Yaiba',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2019,
  },
  {
    keywords: ['炎', 'homura'],
    artistKeywords: ['lisa'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – The Movie: Mugen Train',
    themeType: 'Theme Song',
    themeName: 'Main Theme Song',
    slug: 'Theme',
    year: 2020,
  },
  {
    keywords: ['明け星', 'akeboshi'],
    artistKeywords: ['lisa'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Mugen Train Arc TV',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2021,
  },
  {
    keywords: ['白銀', 'shirogane'],
    artistKeywords: ['lisa'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Mugen Train Arc TV',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2021,
  },
  {
    keywords: ['絆ノ奇跡', 'kizuna no kiseki'],
    artistKeywords: ['man with a mission', 'milet'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Swordsmith Village Arc',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2023,
  },
  {
    keywords: ['コイコガレ', 'koi kogare'],
    artistKeywords: ['milet', 'man with a mission'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Swordsmith Village Arc',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2023,
  },
  {
    keywords: ['夢幻', 'mugen'],
    artistKeywords: ['my first story', 'hyde'],
    anime: 'Demon Slayer: Kimetsu no Yaiba – Hashira Training Arc',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2024,
  },
  {
    keywords: ['アイドル', 'idol'],
    artistKeywords: ['yoasobi'],
    anime: '[OSHI NO KO]',
    animeWesternTitle: 'Oshi no Ko',
    myAnimeListUrl: 'https://myanimelist.net/anime/52034',
    crunchyrollUrl: 'https://www.crunchyroll.com/search?q=oshi+no+ko',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2023,
    season: 'Spring',
  },
  {
    keywords: ['メフィスト', 'mephisto'],
    artistKeywords: ['queen bee', 'ziyoou-vachi', 'ziyoouvachi'],
    anime: '[OSHI NO KO]',
    animeWesternTitle: 'Oshi no Ko',
    myAnimeListUrl: 'https://myanimelist.net/anime/52034',
    crunchyrollUrl: 'https://www.crunchyroll.com/search?q=oshi+no+ko',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2023,
  },
  {
    keywords: ['ファタール', 'fatal'],
    artistKeywords: ['gemn', 'kento nakajima', 'tatsuya kitani'],
    anime: '[OSHI NO KO] Season 2',
    animeWesternTitle: 'Oshi no Ko Season 2',
    myAnimeListUrl: 'https://myanimelist.net/anime/55791',
    crunchyrollUrl: 'https://www.crunchyroll.com/search?q=oshi+no+ko',
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2024,
  },
  {
    keywords: ['廻廻奇譚', 'kaikai kitan'],
    artistKeywords: ['eve'],
    anime: 'Jujutsu Kaisen',
    animeWesternTitle: 'Jujutsu Kaisen',
    myAnimeListUrl: 'https://myanimelist.net/anime/40748',
    crunchyrollUrl: 'https://www.crunchyroll.com/jujutsu-kaisen',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2020,
    season: 'Fall',
  },
  {
    keywords: ['lost in paradise'],
    artistKeywords: ['ali'],
    anime: 'Jujutsu Kaisen',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2020,
  },
  {
    keywords: ['vivid vice'],
    artistKeywords: ['who-ya'],
    anime: 'Jujutsu Kaisen',
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2021,
  },
  {
    keywords: ['青のすみか', 'ao no sumika', 'where our blue is'],
    artistKeywords: ['tatsuya kitani', 'kitani'],
    anime: 'Jujutsu Kaisen Season 2 (Hidden Inventory / Premature Death)',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2023,
  },
  {
    keywords: ['specialz'],
    artistKeywords: ['king gnu'],
    anime: 'Jujutsu Kaisen Season 2 (Shibuya Incident)',
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2023,
  },
  {
    keywords: ['一途', 'ichizu'],
    artistKeywords: ['king gnu'],
    anime: 'Jujutsu Kaisen 0 (The Movie)',
    themeType: 'Theme Song',
    themeName: 'Main Theme Song',
    slug: 'Theme',
    year: 2021,
  },
  {
    keywords: ['逆夢', 'sakayume'],
    artistKeywords: ['king gnu'],
    anime: 'Jujutsu Kaisen 0 (The Movie)',
    themeType: 'Ending',
    themeName: 'Ending Theme Song',
    slug: 'ED',
    year: 2021,
  },
  {
    keywords: ['kick back', 'kickback'],
    artistKeywords: ['kenshi yonezu', 'yonezu'],
    anime: 'Chainsaw Man',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2022,
  },
  {
    keywords: ['chainsaw blood'],
    artistKeywords: ['vaundy'],
    anime: 'Chainsaw Man',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2022,
  },
  {
    keywords: ['残機', 'zanki', 'time left'],
    artistKeywords: ['zutomayo'],
    anime: 'Chainsaw Man',
    themeType: 'Ending',
    themeName: 'Ending 2 (ED2)',
    slug: 'ED2',
    year: 2022,
  },
  {
    keywords: ['刃渡り2億センチ', 'hawatari nioku centi'],
    artistKeywords: ['maximum the hormone'],
    anime: 'Chainsaw Man',
    themeType: 'Ending',
    themeName: 'Ending 3 (ED3)',
    slug: 'ED3',
    year: 2022,
  },
  {
    keywords: ['ちゅ、多様性。', 'chu, tayousei', 'chu tayousei'],
    artistKeywords: ['ano'],
    anime: 'Chainsaw Man',
    themeType: 'Ending',
    themeName: 'Ending 7 (ED7)',
    slug: 'ED7',
    year: 2022,
  },
  {
    keywords: ['勇者', 'yuusha', 'the brave'],
    artistKeywords: ['yoasobi'],
    anime: "Frieren: Beyond Journey's End",
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2023,
  },
  {
    keywords: ['晴る', 'haru', 'sunny'],
    artistKeywords: ['yorushika'],
    anime: "Frieren: Beyond Journey's End",
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2024,
  },
  {
    keywords: ['anytime anywhere'],
    artistKeywords: ['milet'],
    anime: "Frieren: Beyond Journey's End",
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2023,
  },
  {
    keywords: ['ミックスナッツ', 'mixed nuts'],
    artistKeywords: ['official hige dandism', 'higedan'],
    anime: 'SPY x FAMILY',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2022,
  },
  {
    keywords: ['喜劇', 'kigeki', 'comedy'],
    artistKeywords: ['gen hoshino', 'hoshino'],
    anime: 'SPY x FAMILY',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2022,
  },
  {
    keywords: ['色彩', 'shikisai'],
    artistKeywords: ['yama'],
    anime: 'SPY x FAMILY Season 1 Part 2',
    themeType: 'Ending',
    themeName: 'Ending 2 (ED2)',
    slug: 'ED2',
    year: 2022,
  },
  {
    keywords: ['クラクラ', 'kura kura'],
    artistKeywords: ['ado'],
    anime: 'SPY x FAMILY Season 2',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2023,
  },
  {
    keywords: ['心臓を捧げよ！', '心臓を捧げよ', 'shinzou wo sasageyo', 'sasageyo'],
    artistKeywords: ['linked horizon'],
    anime: 'Attack on Titan Season 2',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1 / Series OP3)',
    slug: 'OP1',
    year: 2017,
  },
  {
    keywords: ['紅蓮の弓矢', 'guren no yumiya'],
    artistKeywords: ['linked horizon'],
    anime: 'Attack on Titan Season 1',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2013,
  },
  {
    keywords: ['the rumbling'],
    artistKeywords: ['sim'],
    anime: 'Attack on Titan The Final Season Part 2',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1 / Series OP7)',
    slug: 'OP1',
    year: 2022,
  },
  {
    keywords: ['悪魔の子', 'akuma no ko'],
    artistKeywords: ['ai higuchi'],
    anime: 'Attack on Titan The Final Season Part 2',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1 / Series ED7)',
    slug: 'ED1',
    year: 2022,
  },
  {
    keywords: ['unravel'],
    artistKeywords: ['tk', 'ling tosite sigure'],
    anime: 'Tokyo Ghoul',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2014,
  },
  {
    keywords: ['残酷な天使のテーゼ', 'cruel angel', "a cruel angel's thesis"],
    artistKeywords: ['yoko takahashi', 'takahashi'],
    anime: 'Neon Genesis Evangelion',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1995,
  },
  {
    keywords: ['シルエット', 'silhouette'],
    artistKeywords: ['kana-boon', 'kanaboon'],
    anime: 'Naruto Shippuden',
    themeType: 'Opening',
    themeName: 'Opening 16 (OP16)',
    slug: 'OP16',
    year: 2014,
  },
  {
    keywords: ['ブルーバード', 'blue bird'],
    artistKeywords: ['ikimonogakari'],
    anime: 'Naruto Shippuden',
    themeType: 'Opening',
    themeName: 'Opening 3 (OP3)',
    slug: 'OP3',
    year: 2008,
  },
  {
    keywords: ['ピースサイン', 'peace sign'],
    artistKeywords: ['kenshi yonezu'],
    anime: 'My Hero Academia Season 2',
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2017,
  },
  {
    keywords: ['新時代', 'new genesis', 'shin jidai'],
    artistKeywords: ['ado'],
    anime: 'One Piece Film: Red',
    themeType: 'Theme Song',
    themeName: 'Main Theme Song',
    slug: 'Theme',
    year: 2022,
  },
  {
    keywords: ['ウィーアー!', 'we are!'],
    artistKeywords: ['hiroshi kitadani'],
    anime: 'One Piece',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1999,
  },
  {
    keywords: ['青春コンプレックス', 'seishun complex'],
    artistKeywords: ['kessoku band'],
    anime: 'Bocchi the Rock!',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2022,
  },
  {
    keywords: ['ギターと孤独と蒼い惑星', 'guitar, loneliness and blue planet'],
    artistKeywords: ['kessoku band'],
    anime: 'Bocchi the Rock!',
    themeType: 'Insert',
    themeName: 'Insert Song (Episode 8)',
    slug: 'IN',
    year: 2022,
  },
  {
    keywords: ['bling-bang-bang-born', 'bling bang bang born'],
    artistKeywords: ['creepy nuts'],
    anime: 'Mashle: Magic and Muscles The Divine Visionary Candidate Exam Arc',
    themeType: 'Opening',
    themeName: 'Opening 2 (OP2)',
    slug: 'OP2',
    year: 2024,
  },
  {
    keywords: ['otonoke', 'オトノケ'],
    artistKeywords: ['creepy nuts'],
    anime: 'Dandadan',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2024,
  },
  {
    keywords: ['taidada'],
    artistKeywords: ['zutomayo'],
    anime: 'Dandadan',
    themeType: 'Ending',
    themeName: 'Ending 1 (ED1)',
    slug: 'ED1',
    year: 2024,
  },
  {
    keywords: ['第ゼロ感', 'dai zero kan', 'daizerokan'],
    artistKeywords: ['10-feet'],
    anime: 'THE FIRST SLAM DUNK',
    themeType: 'Theme Song',
    themeName: 'Main Ending Theme',
    slug: 'ED',
    year: 2022,
  },
  {
    keywords: ['前前前世', 'zenzenzense'],
    artistKeywords: ['radwimps'],
    anime: 'Your Name. (君の名は。)',
    themeType: 'Theme Song',
    themeName: 'Theme Song',
    slug: 'Theme',
    year: 2016,
  },
  {
    keywords: ['なんでもないや', 'nandemonaiya'],
    artistKeywords: ['radwimps'],
    anime: 'Your Name. (君の名は。)',
    themeType: 'Ending',
    themeName: 'Ending Theme Song',
    slug: 'ED',
    year: 2016,
  },
  {
    keywords: ['すずめ', 'suzume'],
    artistKeywords: ['radwimps'],
    anime: 'Suzume (すずめの戸締まり)',
    themeType: 'Theme Song',
    themeName: 'Main Theme Song',
    slug: 'Theme',
    year: 2022,
  },
  {
    keywords: ['crossing field'],
    artistKeywords: ['lisa'],
    anime: 'Sword Art Online',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2012,
  },
  {
    keywords: ['again'],
    artistKeywords: ['yui'],
    anime: 'Fullmetal Alchemist: Brotherhood',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2009,
  },
  {
    keywords: ['rain', 'レイン'],
    artistKeywords: ['sid'],
    anime: 'Fullmetal Alchemist: Brotherhood',
    themeType: 'Opening',
    themeName: 'Opening 5 (OP5)',
    slug: 'OP5',
    year: 2010,
  },
  {
    keywords: ['butter-fly', 'butterfly'],
    artistKeywords: ['koji wada', 'wada'],
    anime: 'Digimon Adventure',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1999,
  },
  {
    keywords: ['cha-la head-cha-la', 'chala head chala'],
    artistKeywords: ['hironobu kageyama', 'kageyama'],
    anime: 'Dragon Ball Z',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1989,
  },
  {
    keywords: ['dan dan 心魅かれてく', 'dan dan kokoro'],
    artistKeywords: ['field of view'],
    anime: 'Dragon Ball GT',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1996,
  },
  {
    keywords: ['めざせポケモンマスター', 'mezase pokemon master'],
    artistKeywords: ['rica matsumoto'],
    anime: 'Pokémon (Original Series)',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 1997,
  },
  {
    keywords: ['only my railgun'],
    artistKeywords: ['fripside'],
    anime: 'A Certain Scientific Railgun',
    themeType: 'Opening',
    themeName: 'Opening 1 (OP1)',
    slug: 'OP1',
    year: 2009,
  },
];

/**
 * Format theme name nicely: "Opening 1 (OP1)", "Ending 2 (ED2)"
 */
function formatThemeName(type: string, sequence: number | null, slug?: string): string {
  const fullType = type === 'OP' ? 'Opening' : type === 'ED' ? 'Ending' : 'Insert Song';
  const seqStr = sequence ? ` ${sequence}` : (slug && slug.match(/\d+/) ? ` ${slug.match(/\d+/)?.[0]}` : '');
  const slugStr = slug ? ` (${slug})` : '';
  return `${fullType}${seqStr}${slugStr}`;
}

/**
 * Query AnimeThemes.moe public API for anime theme matches
 */
async function queryAnimeThemesApi(searchQuery: string): Promise<AnimeSoundtrackInfo | null> {
  try {
    const clean = searchQuery.replace(/[^\w\s]/gi, ' ').trim();
    if (!clean || clean.length < 2) return null;

    const url = `https://api.animethemes.moe/search?q=${encodeURIComponent(clean)}&include[song]=animethemes.anime&fields[search]=songs,animethemes`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MusicRomanizer/1.0 (contact@music-app.internal)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const songs = data.search?.songs || [];

    for (const s of songs) {
      if (s.animethemes && s.animethemes.length > 0) {
        const theme = s.animethemes[0];
        const anime = theme.anime;
        if (anime?.name) {
          const themeType: 'Opening' | 'Ending' | 'Insert' =
            theme.type === 'OP' ? 'Opening' : theme.type === 'ED' ? 'Ending' : 'Insert';

          return {
            anime: anime.name,
            themeType,
            themeName: formatThemeName(theme.type, theme.sequence, theme.slug),
            sequence: theme.sequence,
            slug: theme.slug,
            year: anime.year || null,
            season: anime.season || null,
            synopsis: anime.synopsis || undefined,
            source: 'AnimeThemes.moe',
          };
        }
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  return null;
}

/**
 * Enrich anime soundtrack with Western/English title and external database links (MyAnimeList, Crunchyroll)
 */
async function enrichAnimeWithExternalMetadata(
  info: AnimeSoundtrackInfo
): Promise<AnimeSoundtrackInfo> {
  const enriched: AnimeSoundtrackInfo = { ...info };

  try {
    const rawSearch = enriched.animeWesternTitle || enriched.anime;
    // Clean search string for Kitsu query (remove season sub-brackets/dashes that confuse search)
    const cleanSearch = rawSearch
      .replace(/–|—|-/g, ' ')
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/Season \d+/gi, '')
      .replace(/Arc/gi, '')
      .trim();

    const franchiseBase = rawSearch.split(/–|—|:|-|Season|Part/i)[0].trim();
    const searchCandidates: string[] = [];
    if (cleanSearch && cleanSearch.length >= 2) searchCandidates.push(cleanSearch);
    if (franchiseBase && franchiseBase.length >= 2 && !searchCandidates.includes(franchiseBase)) {
      searchCandidates.push(franchiseBase);
    }

    for (const term of searchCandidates) {
      if (enriched.myAnimeListUrl && enriched.crunchyrollUrl && enriched.animeWesternTitle) {
        break;
      }

      const url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(term)}&include=mappings,streamingLinks&page[limit]=1`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.api+json',
          'User-Agent': 'MusicRomanizer/1.0',
        },
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = await res.json();
        const animeData = data.data?.[0];
        if (animeData) {
          const titles = animeData.attributes?.titles || {};
          const enTitle = titles.en || animeData.attributes?.canonicalTitle;
          const jaTitle = titles.ja_jp;

          if (!enriched.animeWesternTitle && enTitle) {
            enriched.animeWesternTitle = enTitle;
          }
          if (!enriched.animeJapaneseTitle && jaTitle) {
            enriched.animeJapaneseTitle = jaTitle;
          }

          const included = Array.isArray(data.included) ? data.included : [];

          // Look for direct MyAnimeList link
          if (!enriched.myAnimeListUrl) {
            const malMapping = included.find(
              (inc: any) =>
                inc.type === 'mappings' &&
                inc.attributes?.externalSite === 'myanimelist/anime' &&
                inc.attributes?.externalId
            );
            if (malMapping?.attributes?.externalId) {
              enriched.myAnimeListUrl = `https://myanimelist.net/anime/${malMapping.attributes.externalId}`;
            }
          }

          // Look for direct Crunchyroll link
          if (!enriched.crunchyrollUrl) {
            const crLink = included.find(
              (inc: any) =>
                inc.type === 'streamingLinks' &&
                typeof inc.attributes?.url === 'string' &&
                inc.attributes.url.includes('crunchyroll.com')
            );
            if (crLink?.attributes?.url) {
              enriched.crunchyrollUrl = crLink.attributes.url;
            }
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // Fallback to primary anime name if Western title still unset
  if (!enriched.animeWesternTitle) {
    enriched.animeWesternTitle = enriched.anime;
  }

  // Provide robust search links if direct links were not in the database
  const queryAnime = enriched.animeWesternTitle || enriched.anime;
  if (!enriched.myAnimeListUrl) {
    enriched.myAnimeListUrl = `https://myanimelist.net/anime.php?q=${encodeURIComponent(queryAnime)}`;
  }
  if (!enriched.crunchyrollUrl) {
    enriched.crunchyrollUrl = `https://www.crunchyroll.com/search?q=${encodeURIComponent(queryAnime)}`;
  }

  return enriched;
}

/**
 * Primary function to find anime soundtrack information
 */
export async function findAnimeSoundtrackInfo(options: {
  japaneseTitle: string;
  romajiTitle: string;
  westernTitle?: string;
  artist?: string;
}): Promise<AnimeSoundtrackInfo | null> {
  const { japaneseTitle, romajiTitle, westernTitle, artist } = options;

  const normalizedTargets = [
    japaneseTitle.toLowerCase().trim(),
    romajiTitle.toLowerCase().trim(),
    westernTitle?.toLowerCase().trim() || '',
  ].filter(Boolean);

  const normArtist = (artist || '').toLowerCase().trim();

  // 1. First check curated catalog for instant 0ms match
  for (const entry of POPULAR_ANIME_THEMES) {
    const titleMatch = entry.keywords.some((kw) =>
      normalizedTargets.some((target) => target.includes(kw) || kw.includes(target))
    );

    if (titleMatch) {
      // If artist was provided, check if artist matches too (or accept if no artist was specified)
      if (normArtist && entry.artistKeywords) {
        const artistMatch = entry.artistKeywords.some((akw) =>
          normArtist.includes(akw) || akw.includes(normArtist)
        );
        if (artistMatch) {
          return await enrichAnimeWithExternalMetadata({
            anime: entry.anime,
            animeWesternTitle: entry.animeWesternTitle,
            animeJapaneseTitle: entry.animeJapaneseTitle,
            myAnimeListUrl: entry.myAnimeListUrl,
            crunchyrollUrl: entry.crunchyrollUrl,
            themeType: entry.themeType,
            themeName: entry.themeName,
            slug: entry.slug,
            year: entry.year,
            season: entry.season,
            source: 'Official Soundtrack Records',
          });
        }
      } else {
        return await enrichAnimeWithExternalMetadata({
          anime: entry.anime,
          animeWesternTitle: entry.animeWesternTitle,
          animeJapaneseTitle: entry.animeJapaneseTitle,
          myAnimeListUrl: entry.myAnimeListUrl,
          crunchyrollUrl: entry.crunchyrollUrl,
          themeType: entry.themeType,
          themeName: entry.themeName,
          slug: entry.slug,
          year: entry.year,
          season: entry.season,
          source: 'Official Soundtrack Records',
        });
      }
    }
  }

  // 2. Query AnimeThemes.moe live API with title variants
  const queriesToTest = [
    westernTitle,
    romajiTitle,
    japaneseTitle,
  ].filter((q): q is string => Boolean(q && q.trim().length > 1));

  for (const q of queriesToTest) {
    const result = await queryAnimeThemesApi(q);
    if (result) {
      return await enrichAnimeWithExternalMetadata(result);
    }
  }

  return null;
}
