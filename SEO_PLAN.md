# Mission Pure Visibility Roadmap (SEO + AEO + GEO)

_Last updated: 2026-05-25_

## Objectives

1. **Rank** for every profitable DFW water-filtration query (city + service + concern).
2. **Answer** the urgent water questions parents ask (and feed the answers to GBP + AI engines).
3. **Get cited** as the DFW data authority on contaminants.

## Workstreams & Actions

### 1. Technical / Foundation

| Priority | Action | Owner | Notes |
| --- | --- | --- | --- |
| P0 | Submit `sitemap.xml` to Google/Bing Search Console and enable IndexNow pinging | Dev | Once new pages live |
| P0 | Ensure `robots.txt` allows crawl and links sitemap (done) | Dev | Monitor logs |
| P1 | Add canonical + meta descriptions + OpenGraph to every new page | Dev | Template update |
| P1 | Add structured data validators to CI/manual checklist | Dev | Use Rich Results Test |
| P2 | Integrate Plausible/GA4 + Search Console for keyword tracking | Dev/Marketing | Needed to show progress |

### 2. Data + Trust Signals

| Priority | Action | Notes |
| --- | --- | --- |
| P0 | Fix contaminant multiplier data (add `thisUtilityValue` + `guidelineValue`) and fallback guidelines | Restores "×" badges |
| P0 | Add `Review` schema + carousel for existing 5★ testimonials | Feed GBP + site |
| P1 | Publish expert bios + credentials (licensed installers, water specialists) | Supports E-E-A-T |
| P1 | Build downloadable "Mission Pure Water Watch" PDF + CSV for AI citation | Host at `/reports/2026-q2-water-watch.pdf` |
| P2 | Add trust badges ("Verified DFW Utility Lookup", etc.) with explanatory copy | On homepage + footer |

### 3. Content Expansion (SEO)

#### City Landing Pages (Phase 1)

- Dallas
- Fort Worth
- Plano
- Frisco
- McKinney
- Allen
- Southlake
- Grapevine
- Denton
- Rockwall

Each page must include:
- Localized hero, contaminant stats, testimonial, CTA.
- FAQ (3+ questions) with `FAQPage` schema.
- Internal links: service pages, contact, ZIP lookup.

#### Service / Intent Pages (Phase 1)

- Under-Sink Reverse Osmosis
- Whole-Home UV + Carbon
- Shower/Bath Filters for Kids
- Nursery/Baby Formula Water Safety
- Commercial Kitchens / Cafés
- Well Water Remediation (DFW perimeter)

### 4. Answer Engine Optimization (AEO)

| Priority | Action |
| --- | --- |
| P0 | Add homepage FAQ (5 questions) + `FAQPage` schema |
| P0 | Add `HowTo` schema for "How to read your Mission Pure report" |
| P1 | Create "Ask Mission Pure" micro-articles (one Q per page, `<article>` + `SpeakableSpecification`) |
| P1 | Mirror FAQ content into GBP Q&A (copy/paste answers) |
| P2 | Add conversational metadata (`schema.org/QAPage`) on select blog posts |

### 5. GEO (Generative Engine Optimization)

| Priority | Action |
| --- | --- |
| P0 | Host structured contaminant dataset (CSV/JSON) with description + license |
| P1 | Publish quarterly "Mission Pure Water Watch" report and issue press release |
| P1 | Pitch local media/health influencers with data quotes (they link → AI cites) |
| P2 | Create API endpoint (`/api/contaminants-by-zip`) with documentation |

### 6. Google Business Profile

1. Verify primary category = **Water purification company**, secondary = Water testing service / Water filter supplier.
2. Update "From the business" description (750 chars, include DFW keywords).
3. Add product tiles linking to new service pages.
4. Post weekly (water alerts, new articles, customer wins).
5. Seed 5 Q&A entries with authoritative answers.
6. Gather 5 new reviews (goal: each mentions city + issue + outcome).
7. Upload HQ photos/videos (lookup tool, installations, team).

### 7. Monitoring & Reporting

- Weekly keyword check: Search Console, manual SERP spot checks for "DFW water filtration", "[city] water filter".
- Monthly KPI deck: impressions, clicks, GBP actions, citations, backlinks.
- Error monitoring: 404s, schema warnings, Core Web Vitals.

## Next Steps (in execution order)

1. **Data/UI fixes** – add guideline fallback + update dataset so the × badges reappear; add FAQ + schema to homepage.
2. **City template** – design one city page (e.g., Dallas) and replicate for the remaining nine.
3. **Service template** – same approach for under-sink, shower, etc.
4. **GBP content** – craft description, Q&A, posts, review prompts.
5. **Data assets** – produce CSV/PDF + API stub.
6. **Off-page/PR** – outreach after content foundation exists.

_This roadmap will be updated as milestones ship._
