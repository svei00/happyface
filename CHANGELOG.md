# 😊 Happy Face — Changelog

Versions listed oldest → newest. Latest version is at the bottom.

---

## v1.0 — 2026-03 (Initial Release)

### Features
- Home screen with kid cards and leaderboard
- 7×10 grid per kid (70 cells = 1 week × 10 faces/day)
- 10 good faces, 5 bad faces
- 3 bad face behavior modes: Block, Separate, Cancel Out
- PIN-protected settings (default: 1234)
- Kid photo + prize photo upload (camera or gallery)
- Draw system — weekly cycle with winner tracking
- Last draw winner banner on home screen
- 6 kid color palettes
- Fredoka font, warm cream color scheme

---

## v1.1 — 2026-03

### Changes
- Added 5 new good faces (15 total from 10)
- Face picker grid changed to 5 columns

---

## v1.2 — 2026-03

### Bug Fixes
- **Grid fill direction fixed** — grid now fills top-to-bottom within each column (each column = 1 day). Previously filled left-to-right which was incorrect
- **Leaderboard ranking fixed** — now uses 3-tier sort: most happy faces → fewest bad faces → most all-time draw wins. Previously only sorted by happy faces

---

## v1.3 — 2026-03

### New Features
- **Seasonal face system** — Row 3 of the face picker auto-swaps by calendar date. Settings → Seasonal Faces to control (Auto / Off / Force any season)
- **5 seasonal sets**: 🎃 Halloween (Oct), 🎄 Christmas (Dec 1–25), 💝 Valentine (Feb 1–14), 🐣 Easter (Mar 20–Apr 20), ☀️ Summer (Jun 21–Sep 21)
- **6 bad faces** — added ❌ No Way! to complete a full row
- **18 good faces total** — 3 perfect rows of 6

### Added faces
- 😇 Angel · 😜 Wild & Crazy · 😅 So Close!
- ❤️ Red Heart · 🙃 Silly Happy · ✅ Check! · 👍 Thumbs Up · 😽 Cat Kiss

---

## v1.4 — 2026-03

### Changes
- Deployment guide updated for Nginx Proxy Manager (NPM)
- Fixed `package.json` with pinned versions (Vite 5.4.1 + vite-plugin-pwa 0.20.5) to resolve `npm audit fix --force` breakage

---

## v2.0 — 2026-03

### Major Changes
- **SQLite database via Express backend** — replaced browser localStorage with a proper server-side database. All devices (phone, tablet, laptop) now share the same data in real time
- **New file: `server.js`** — Express server serves both the React app and the `/api/data` REST endpoint on port 3456
- **`happyface.db`** — SQLite file on the DietPi server. Survives updates and reboots
- **Debounced saves** — saves fire 400ms after last change to avoid hammering the server on rapid taps

### Why SQLite over a plain JSON file?
SQLite handles concurrent writes safely. A plain JSON file can corrupt if two devices save at the same moment. SQLite is also just a file — no separate database server process needed.

### Photos now shared across devices
Photos are stored as base64 text inside SQLite. When your wife uploads a photo on her phone, it is instantly visible to everyone on any device.

---

## v3.0 — 2026-03

### New Features
- **12 bad faces** (2 full rows of 6): 😡 😤 🤬 😠 👎 ❌ 😈 🙄 😒 😞 🤦 💢
- **10 kid color palettes** — added Rose, Indigo, Sky Blue, and Navy to the original 6 (Orange, Pink, Purple, Teal, Green, Amber)
- **Prize background opacity slider** — Settings → Prize Background Opacity. Drag between Subtle and Bold. Applies to both home cards and the grid background
- **Brand logo per kid** — upload a brand logo (e.g. Hot Wheels 🏷️) shown as a watermark on kid cards and in the grid
- **Sticky default face** — long press any empty grid cell to set a default face. Future taps auto-add that face without opening the picker. Resets on page reload (session only by design)
- **Prize name editable** — tap the prize name in Settings to type the specific prize (e.g. "Hot Wheels Twin Mill")
- **😊 Favicon + PWA manifest** — the spinning happy face now appears as the browser tab icon and as the home screen app icon on both Android and iPhone

### Bug Fixes
- **Season face ID collision fixed** — each season now has unique face IDs (h1–h6, c1–c6, v1–v6, e1–e6, su1–su6). Previously forcing Halloween could show Summer faces in the grid because all seasons shared the IDs s1–s6 and the last registered season won
- **Spinning emoji on loading/PIN screens** — the rotating 😊 animation now works correctly in the deployed server app

### Kids renamed
- Emma → **Eileencita** (pink palette by default)
- Lucas → **Andy** (navy palette by default)

### GitHub Auto-Deploy added
- `.github/workflows/deploy.yml` — pushing to the `main` branch automatically pulls, rebuilds, and restarts the server
- `.gitignore` — `happyface.db` is excluded so data is never overwritten by a deploy

---

## v3.1 — 2026-03

### New Features
- **👆 Fingerprint / Face ID unlock** — on mobile (Android Chrome, iPhone Safari), the Settings PIN screen now offers biometric authentication using the WebAuthn browser standard
  - First time: ⚙️ → enter PIN → Security → tap **"Set Up"** → scan finger
  - After setup: the fingerprint prompt appears automatically when entering the parent area
  - PIN always remains available as fallback
  - On desktop/laptop: fingerprint button never shows — PIN only
  - Each device registers independently. Your wife registers on her phone separately. Both credentials are stored in the database

### Bad Face Changes
- 😈 Smiling Devil → **👿 Angry Devil** (no smile)
- 🙄 Eye Roll → **😭 Crying**
- 💢 Rage → **👺 Ogre**

---

## v3.2 — 2026-03

### Bug Fix — Installation
- **Replaced `better-sqlite3` with Node.js built-in SQLite (`node:sqlite`)** — `better-sqlite3` is a native C++ addon that requires `make`, `gcc`, and build tools to compile from source. DietPi does not have these installed by default, causing `npm install` to fail with a `gyp ERR! not found: make` error. Node v22.5+ (user has v25.8.0) ships with SQLite built-in via `require('node:sqlite')`. Zero compilation, zero new dependencies, same behaviour.
- `better-sqlite3` removed from `package.json` entirely — `npm install` now only installs `express`, `react`, `react-dom`, and Vite dev tools, all of which are pure JavaScript and install instantly

### Database auto-creation
- `happyface.db` is created automatically on first server start if it does not exist. No manual step needed. If the file already exists, it is left untouched.

---

## v3.3 — 2026-03

### Bug Fixes
- **Tap on grid now quick-adds immediately** — 😊 Happy Face is pre-set as the default on startup. Tap any empty cell and it adds instantly without opening any picker. Long press an empty cell to change the default to a different face
- **Long press no longer misfires while scrolling** — touch movement detection added. If your finger moves more than 8px (i.e. you are scrolling), the long press is cancelled automatically so it never triggers accidentally
- **`touchAction: none`** added to grid cells so the browser does not interfere with tap vs scroll detection

### Removed
- **Brand logo feature removed** — uploading a brand logo (Hot Wheels etc.) looked messy with arbitrary screenshots and downloaded images. Removed entirely to keep the cards clean. The prize photo background and prize name are still fully functional

### Settings clarity
- Prize name field now shows hint text: "👆 Tap to edit" so it is obvious it is editable
- Fingerprint section now explains clearly that **HTTPS is required** — use `https://villanueva.ddns.net` through Nginx Proxy Manager instead of the local IP address `192.168.50.148:3456`. Register fingerprint after opening via the HTTPS domain

### Prize opacity
- Opacity slider now only controls the prize photo background — no conflict with the logo (which is removed)

---

## v3.4 — 2026-03

### Brand Logo — restored and fixed properly
- **Restored** — brand logo was incorrectly removed in v3.3. Apologies for that.
- **Centered** — logo now appears in the center of the card, not bottom-right
- **No transparency by default** — logo shows at 100% opacity by default
- **Separate opacity control** — Settings now has two independent sliders:
  - 🎁 Prize Photo (background watermark) — subtle by design, range 2%–35%
  - 🏷️ Brand Logo (centered overlay) — full by default, range 10%–100%
- **Logo sits behind all text and numbers** (z-index fixed) — percentage, name, face count are always readable on top
- **Card taller** — `minHeight: 210px` added so logo never overlaps the progress bar or percentage

### Settings hint
- Added note below photo pickers: "Brand Logo appears centered on the card behind content. Opacity is set separately in Settings above."
