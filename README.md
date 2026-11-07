<p align="center">
  <img src="branding/icon_16b9.png" alt="YouTube TV+" width="480" height="270">
</p>

<h1 align="center">YouTube TV+</h1>

<p align="center">
  YouTube with SponsorBlock, ad-blocking, and playback enhancements — running entirely on your Samsung TV.
</p>

<p align="center">
  <a href="https://github.com/xiiixviiixi/YTV-Plus/releases/latest">
    <img src="https://img.shields.io/github/v/release/xiiixviiixi/YTV-Plus?label=release&style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/xiiixviiixi/YTV-Plus/releases">
    <img src="https://img.shields.io/github/downloads/xiiixviiixi/YTV-Plus/total?style=flat-square" alt="Total Downloads">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/xiiixviiixi/YTV-Plus?style=flat-square" alt="License">
  </a>
  <a href="https://tizen.org/">
    <img src="https://img.shields.io/badge/Tizen-2.4%2B-brightgreen?style=flat-square" alt="Tizen Version">
  </a>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **SponsorBlock** | Auto-skips sponsored segments, marks progress bar |
| **Ad Blocking** | Removes YouTube TV ads, inline & pre-roll |
| **PiP Mode** | Picture-in-Picture support |
| **More Subtitles** | Extended subtitle language selection |
| **Playback Speed** | Variable speed control |
| **DeArrow** | Removes clickbait titles/thumbnails |
| **Auto Frame Rate** | Matches video frame rate |
| **Quality Selector** | Preferred resolution preset |

---

## Install

1. **Download** the latest `YouTube-TV-Plus-v*.zip` from [Releases](https://github.com/xiiixviiixi/YTV-Plus/releases/latest)
2. **Extract** the unsigned WGT (`YouTube-TV-Plus-*-resign-required.wgt`)
3. **Sign** it with your Samsung certificate profile (must include your TV's DUID)
   - [Tizen Studio + Certificate Manager](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)
   - `tizen package -t wgt -s YOUR_PROFILE -- path/to/unsigned.wgt`
4. **Install** the signed WGT on your TV via Tizen Studio or USB
5. **Launch** **YouTube TV+** from Apps

> The app opens YouTube TV with all modifications active. Not distributed through Samsung Apps.

---

## Build from Source

```bash
# Requirements: Node.js 22+, Tizen Studio (for native TLS)
npm install
npm run build

# Output: artifacts/YouTube-TV-Plus-unsigned.wgt
```

---

## Project Structure

```
├── legacy/           # Tizen 2.4 widget (released build)
│   ├── widget/       # Web app + config.xml
│   ├── build.js      # WGT packager (ES5 checked)
│   └── test/         # Unit tests (npm test)
├── standalone/       # Tizen 3.0+ standalone app + service
├── mods/             # Shared modifications (ES modules)
├── branding/         # 16:9 & 1:1 launcher icons
└── generate_branding.py  # Icon generator (requires Pillow)
```

---

## Credits

- Built by **The Standard Software Company**
- SponsorBlock data from [sponsor.ajay.app](https://sponsor.ajay.app/)
- Inspired by the Tizen homebrew community

---

## License

MIT — see [LICENSE](LICENSE) and [third-party notices](legacy/THIRD_PARTY_NOTICES.txt).

---

<p align="center">
  <sub>An original project. Not a fork.</sub>
</p>
