# The Vision of World

**Real-time global intelligence dashboard** — live news, 3D globe, markets, military tracking, and geopolitical data in one view.

**Live site:** https://bachhhhhhhhhhhhhh.github.io/livewweb/docs/dashboard.html

**Creator:** [Brian Bach Truong](https://www.linkedin.com/in/bachtruong123/) — Data Analyst, Honda

---

## Features

- 3D globe + flat map with geopolitical layers
- Real-time news from 500+ curated feeds
- Live streams (YouTube) and live webcams
- AI Chat Analyst (add your Groq API key in Settings)
- Vietnam timezone (ICT) supported
- No login required — all Pro features unlocked on this deployment

---

## Deploy

```bash
npm install
npm run build:pages
node scripts/deploy-pages-local.mjs
git add docs/ && git commit -m "deploy" && git push origin main
```

GitHub Pages serves from the `docs/` folder on `main`.

---

## Based on

Fork of [World Monitor](https://github.com/koala73/worldmonitor) (AGPL-3.0), customized for GitHub Pages static hosting.