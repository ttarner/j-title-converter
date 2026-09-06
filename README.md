# J-Title Romanizer & Western Title Finder

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A full-stack application designed to romanize Japanese song titles and discover their official Western/international releases across streaming platforms and global music databases.

Supports direct Japanese text input, song links from **Spotify**, **Apple Music**, and **YouTube**, as well as mobile screenshots via **Tesseract OCR**.

---

## Features

- **Accurate Japanese Transliteration**:
  - Converts Kanji, Hiragana, and Katakana into formatted Hepburn Romaji and search-friendly plain variants.
  - Powered by [Kuroshiro](https://github.com/hexenq/kuroshiro) with the [Kuromoji](https://github.com/takuyaa/kuromoji.js) morphological analyzer, backed by [WanaKana](https://wanakana.com/).
- **Katakana Loanword Heuristics**:
  - Automatically identifies English/foreign loanwords in Katakana (e.g. `プラスティック・ラブ` &rarr; `Plastic Love`, `シャケナベイベー` &rarr; `Shake na baby`).
- **Streaming Link Resolver**:
  - Paste any track URL from **Spotify**, **Apple Music**, or **YouTube / YouTube Music** to extract clean track titles, artist names, album art, and streaming previews without typing Japanese characters manually.
- **Screenshot OCR with Noise Filtering**:
  - Upload mobile screenshots from Spotify, Apple Music, or YouTube Music.
  - Uses [Tesseract.js](https://tesseract.projectnaptha.com/) with bilingual `jpn+eng` recognition models.
  - Automatically filters status bar clutter (battery %, Wi-Fi, 5G, carrier, timestamps) and playback UI buttons.
- **Global Music Databases**:
  - Matches songs against **MusicBrainz**, **iTunes Store API**, and optionally **Spotify Web API** to locate official Western metadata, romanized aliases, and direct links.
- **Anime Soundtrack Information**:
  - Detects if a song was featured as an Anime Opening (OP), Ending (ED), or Theme Song with links to **MyAnimeList** and **Crunchyroll**.
- **Audio Previews**:
  - Listen to 30-second audio previews directly in the browser when provided by the iTunes Store or Spotify.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion, Lucide React icons
- **Backend**: Node.js, Express, tsx, esbuild
- **Language Processing**: Kuroshiro, Kuromoji Analyzer, WanaKana
- **OCR Engine**: Tesseract.js (`jpn` + `eng`)
- **APIs Integrated**: MusicBrainz, iTunes Search API, Jikan (MyAnimeList), Spotify Web API & oEmbed, YouTube oEmbed

---

## Project Structure

```text
j-title-converter/
├── .vscode/                 # Workspace settings, launch profiles & extension recommendations
├── public/                  # Static assets
├── server/                  # Backend modules
│   ├── anime.ts             # Anime OST detection & curated theme catalog
│   ├── converter.ts         # Kuroshiro transliteration & Katakana heuristics
│   ├── music.ts             # MusicBrainz & iTunes / Spotify matching
│   ├── ocr.ts               # Tesseract.js screenshot processing & filtering
│   └── streaming.ts         # Spotify, Apple Music, and YouTube link resolvers
├── src/                     # React frontend
│   ├── components/          # UI components (Search, Results, History, AudioPlayer)
│   ├── App.tsx              # Application layout & state management
│   ├── declarations.d.ts    # TypeScript definitions for untyped modules
│   ├── index.css            # Tailwind styles
│   ├── main.tsx             # React DOM entrypoint
│   └── types.ts             # TypeScript interfaces
├── Dockerfile               # Multi-stage production container
├── LICENSE                  # MIT License
├── package.json             # Scripts & dependencies
├── server.ts                # Express server & Vite middleware
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite frontend configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node `v20` and `v22`)
- **npm** (or `pnpm` / `yarn`)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/j-title-converter.git
cd j-title-converter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables (Optional)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The application works out of the box with zero configuration! If you want to enhance Spotify search or configure custom ports, you can specify:

| Variable                | Description                                                         | Default               |
| :---------------------- | :------------------------------------------------------------------ | :-------------------- |
| `PORT`                  | Port the Express server listens on                                  | `3000`                |
| `MUSICBRAINZ_CONTACT`   | Contact email for the `User-Agent` header when querying MusicBrainz | `contact@example.com` |
| `SPOTIFY_CLIENT_ID`     | Spotify Developer Client ID (optional, enhances Spotify search)     | `""`                  |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer Client Secret (optional)                          | `""`                  |

### 4. Run in Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Changes in both client and server will automatically reload with Vite HMR.

### 5. VS Code Debugging

If developing in Visual Studio Code, press `F5` or open the **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`) to use one of the preconfigured profiles:

- **Dev Server (npm run dev)**: Starts the full-stack server with Vite middleware.
- **Debug Server (tsx server.ts)**: Attaches the Node.js debugger directly to the backend with breakpoints enabled.
- **Production Server (dist/server.cjs)**: Runs the compiled production bundle.

---

## Scripts

| Command                | Description                                                                  |
| :--------------------- | :--------------------------------------------------------------------------- |
| `npm run dev`          | Start development server with Vite hot module replacement                    |
| `npm run build`        | Build production client with Vite and bundle server with esbuild             |
| `npm start`            | Run compiled production bundle (`dist/server.cjs`)                           |
| `npm run lint`         | Run TypeScript type checking (`tsc --noEmit`)                                |
| `npm run build:mobile` | Build Vite frontend and sync native assets to Android and iOS                |
| `npm run cap:sync`     | Copy web assets and update Capacitor native plugins                          |
| `npm run version:sync` | Apply `YYYY.MM.DD.HHMM` timestamp version across package.json, Android & iOS |
| `npm run clean`        | Remove `dist/` build artifacts                                               |

---

## Mobile Apps (Android APK & iOS IPA)

The application supports standalone execution on mobile devices via [Capacitor](https://capacitorjs.com/):

- **Universal Service Layer**: In web mode, requests use `POST /api/convert` to Express. In mobile mode (`Capacitor.isNativePlatform()`), conversion runs **directly on the device** with `CapacitorHttp` natively bypassing browser CORS restrictions.
- **Android**:
  ```bash
  npm run build:mobile
  npx cap open android
  ```
  Builds debug or release `.apk` using Android Studio or Gradle (`./gradlew assembleRelease`).
- **iOS**:
  ```bash
  npm run build:mobile
  npx cap open ios
  ```
  Opens Xcode to run in the iOS Simulator or archive for distribution.

### System Share Sheet & Deep Linking

J-Title Converter supports sharing directly from other apps:

- **Android (APK)**:
  - **Direct Share Menu**: J-Title Converter appears natively in the Android system Share sheet (`ACTION_SEND`).
  - **Streaming Links**: Tap **Share** inside Spotify, YouTube, YouTube Music, or Apple Music and select **J-Title Converter** — the app opens and resolves the track automatically.
  - **Screenshots & Images**: Share a screenshot from your Gallery or photo viewer to run instant OCR and extract song details.
  - **Text & Lyrics**: Highlight Japanese text in any app or browser and tap **Share** to find the romanization and western titles.

- **iOS (IPA)**:
  - **Custom URL Scheme**: Registered scheme `jtitle://`. Supports:
    - `jtitle://convert?url=<encoded_url>` (e.g. `jtitle://convert?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F...`)
    - `jtitle://search?q=<title>&artist=<artist>`
  - **iOS Shortcuts**: Easily bind an iOS Share Sheet action that takes the shared link or text and opens `jtitle://convert?url=ShortcutInput`.

---

## DevOps & Automated GitHub Releases

Automated workflows are located in `.github/workflows/`:

- **CI (`ci.yml`)**:
  - Triggers on Pull Requests and pushes to `main`.
  - Runs TypeScript linting, production bundling, and Docker container verification.

- **Release (`release.yml`)**:
  - Triggered manually from GitHub Actions (**Run workflow**) or by pushing a release tag (`v*`).
  - **Timestamp Versioning (`YYYY.MM.DD.HHMM`)**: Automatically generates the version timestamp at build time (e.g. `2026.09.06.0045`) and stamps it across:
    - `package.json` (`version`)
    - Android `build.gradle` (`versionName` and auto-incrementing `versionCode`)
    - iOS `Info.plist` (`CFBundleShortVersionString` and `CFBundleVersion`)
  - **Builds & Publishes**:
    - **Android APK**: `j-title-converter-<version>.apk` (ready to sideload)
    - **iOS IPA**: `j-title-converter-<version>.ipa` (ready to install via AltStore, Sideloadly, TrollStore, etc.)
    - **Web Bundle**: `j-title-converter-<version>-web.tar.gz`
    - Creates the GitHub Release with automated changelog notes and attached binary downloads.

---

## Production Build & Run

To build the static frontend assets and bundle the server for production:

```bash
npm run build
npm start
```

The production server serves the optimized Vite build and handles all API routes on `PORT` (default `3000`).

---

## Deployment

### Deploy with Docker

A production-ready, multi-stage `Dockerfile` is included:

```bash
# Build the Docker image
docker build -t j-title-converter .

# Run the container on port 3000
docker run -p 3000:3000 --env-file .env j-title-converter
```

### Deploy to Cloud Platforms

- **Render / Railway**:
  - Connect your GitHub repository.
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - Set `PORT` (or let the platform automatically assign it).

- **Fly.io**:
  - Run `fly launch` to detect the `Dockerfile` and deploy with minimal configuration.

- **Google Cloud Run**:
  - Build and submit the container via Google Cloud Build, then deploy the image with an exposed port of `3000` (or `8080`).

---

## API Endpoints

### `POST /api/convert`

Converts Japanese title, resolves streaming link, or extracts text from a screenshot.

**Request Body:**

```json
{
  "text": "残響散歌",
  "artist": "Aimer",
  "streamingUrl": "",
  "imageBase64": ""
}
```

**Response Example:**

```json
{
  "success": true,
  "input": {
    "text": "残響散歌",
    "artist": "Aimer",
    "sourceType": "text"
  },
  "transliteration": {
    "original": "残響散歌",
    "romaji": "Zankyousanka",
    "romajiHepburn": "zankyousanka",
    "romajiPlain": "zankyosanka",
    "hiragana": "ざんきょうさんか",
    "katakana": "ザンキョウサンカ"
  },
  "primaryWesternTitle": "Zankyosanka",
  "musicMatches": [
    {
      "title": "Zankyosanka",
      "artist": "Aimer",
      "source": "iTunes",
      "externalUrl": "https://music.apple.com/...",
      "confidence": "high"
    }
  ],
  "animeInfo": {
    "anime": "Demon Slayer: Kimetsu no Yaiba – Entertainment District Arc",
    "themeType": "Opening",
    "themeName": "Opening 1 (OP1)",
    "year": 2022
  }
}
```

### `POST /api/ocr`

Performs OCR directly on a base64-encoded image and extracts likely song title and artist.

### `GET /api/presets`

Returns curated song presets for quick testing.

### `GET /api/health`

Health check endpoint reporting API and engine status.

---

## License

This project is licensed under the [MIT License](LICENSE).
