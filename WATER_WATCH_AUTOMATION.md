# Water Watch Automation Overview

The `scripts/water-watch-refresh.js` utility keeps `water-watch.html` fresh without manual copy/paste.

## How it works
1. **Sources** – `data/water-watch-sources.json` lists RSS feeds we trust (Community Impact city pages by default). Add more entries with `{ id, label, type, url, city, keywords, defaultCta }`.
2. **Collector** – Run `npm run waterwatch:refresh`. The script fetches each feed, filters articles that mention water/utility keywords, and normalizes them.
3. **Feed JSON** – Normalized entries are saved to `data/water-watch-feed.json` for debugging or future dashboards.
4. **Page injection** – Content between the `<!-- WATER_WATCH_FEATURED:START/END -->` and `<!-- WATER_WATCH_POSTS:START/END -->` markers inside `water-watch.html` is replaced with fresh markup (featured story, fact panel, and three cards).
5. **Fallbacks** – If no qualifying feeds return data, we fall back to pre-written Mission Pure stories so the page still updates.

## Running it
```bash
npm install          # first time only (installs fast-xml-parser)
npm run waterwatch:refresh
```

Automate via Windows Task Scheduler or a cron job on your host to run daily/weekly.

## Customizing
- **Add sources** – Append objects to `water-watch-sources.json`. Use `/feed/` on WordPress sites (many HOAs + local news outlets). Include keywords to avoid unrelated stories.
- **Adjust templates** – Update `buildFeaturedHtml` or `buildPostsHtml` inside `scripts/water-watch-refresh.js` if you want different copy.
- **Evergreen snippets** – Modify `FALLBACK_ENTRIES` in the script with your own go-to stories.

## Notifications (optional)
The script currently logs to the console. If you want email/Slack alerts when new feed items are ingested, we can extend the script to send SMTP requests or webhook pings—still free.
