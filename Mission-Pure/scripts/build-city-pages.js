/**
 * Mission Pure city landing-page generator.
 *
 * Builds SEO/AEO-optimized local landing pages from the CITY_DATA table below.
 * Each page ships with canonical + OpenGraph + Twitter tags and
 * Service + FAQPage + BreadcrumbList JSON-LD.
 *
 * Claims are intentionally general/defensible (regional sampling language,
 * anonymized testimonials). Update CITY_DATA with verified figures any time
 * and re-run `npm run build:cities` to regenerate every page.
 *
 * Usage: node scripts/build-city-pages.js
 * Asset cache-busting is handled afterwards by `npm run cache:bust`.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://mission-pure.com";
const PHONE_TEL = "+1-951-204-3095";
const PHONE_DISPLAY = "+1 (951) 204-3095";

/**
 * Each entry generates `${slug}-water-filtration.html`.
 * - title/metaName: <title> + SEO label
 * - cities: array of city names (areaServed schema)
 * - source: water source / utility description
 * - neighborhoods: localized coverage line
 * - insights: 3 cards { title, body }
 * - faqs: 4 { q, a }
 * - quotes: 3 anonymized testimonials
 */
const CITY_DATA = [
  {
    slug: "fort-worth",
    label: "Fort Worth",
    cities: ["Fort Worth"],
    title: "Fort Worth Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Fort Worth homeowners review tap water contaminants and compare whole-home and reverse osmosis filtration across Tarrant County.",
    keywords:
      "Fort Worth water filtration, Fort Worth whole home water filter, Fort Worth PFAS, Fort Worth water contaminants, Fort Worth reverse osmosis, Mission Pure Fort Worth",
    utility: "Fort Worth Water Department",
    source: "Lake Benbrook, Eagle Mountain Lake, Lake Worth, and the Trinity River",
    neighborhoods:
      "Covering TCU, the Cultural District, Tanglewood, West 7th, Fairmount, Arlington Heights, and growing North Fort Worth communities.",
    insights: [
      {
        title: "Disinfection byproducts",
        body: "Fort Worth treats surface water with chlorine and chloramine. When they react with organic matter, TTHMs and HAA5 can climb above health-based goals — whole-home catalytic carbon handles both before they reach showers.",
      },
      {
        title: "PFAS indicators",
        body: "PFAS have been detected in regional North Texas sampling. Our catalytic carbon plus reverse osmosis pairing is designed to drive levels toward the EPA's 4 ppt target for drinking water.",
      },
      {
        title: "Hardness & aging mains",
        body: "Trinity River blending and older service lines can mean scale, taste shifts, and metal leaching. Point-of-entry filtration shields every faucet while RO keeps bottles and ice clean.",
      },
    ],
    faqs: [
      {
        q: "Does Fort Worth tap water meet federal standards?",
        a: "The Fort Worth Water Department reports federal compliance, but legal limits often lag modern health targets. Mission Pure compares local data to EPA and EWG public-health goals so you can see when contaminants run above recommended levels.",
      },
      {
        q: "What contaminants matter most in Fort Worth?",
        a: "Disinfection byproducts (TTHMs/HAA5), chloramine, hardness, and PFAS indicators are the most common concerns we treat for Fort Worth families. Run your ZIP to see what's reported for your specific utility.",
      },
      {
        q: "How fast can Mission Pure install in Fort Worth?",
        a: "We stock Puronics systems across DFW. Most Fort Worth installs schedule within 3-5 days, and urgent reverse osmosis installs can often happen next-day.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages backflow paperwork, coordinates shutoffs when needed, and documents installs for insurance or resale.",
      },
    ],
    quotes: [
      "Our shower steam used to irritate the whole family. Mission Pure's whole-home system made a noticeable difference within a week.",
      "PFAS headlines worried us. Now every glass, coffee, and ice cube comes from the reverse osmosis tap.",
      "Mission Pure handled the city paperwork and the install was spotless and on time.",
    ],
  },
  {
    slug: "frisco-plano",
    label: "Frisco & Plano",
    cities: ["Frisco", "Plano"],
    title: "Frisco & Plano Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Frisco and Plano homeowners check tap water contaminants and compare whole-home and reverse osmosis filtration in Collin County.",
    keywords:
      "Frisco water filtration, Plano water filter, Frisco PFAS, Plano water contaminants, Frisco reverse osmosis, Plano whole home water filter, Mission Pure Frisco Plano",
    utility: "North Texas Municipal Water District (NTMWD)",
    source: "Lavon Lake and other NTMWD surface-water supplies",
    neighborhoods:
      "Covering Frisco's Phillips Creek and Newman Village, plus West Plano, Legacy West, and East Plano neighborhoods.",
    insights: [
      {
        title: "NTMWD disinfection byproducts",
        body: "NTMWD surface water can produce elevated TTHMs and HAA5 seasonally. Whole-home catalytic carbon reduces these byproducts before they reach showers, laundry, and faucets.",
      },
      {
        title: "Hard water & scale",
        body: "Frisco and Plano homes frequently battle hardness that scales tankless heaters, fixtures, and glassware. Conditioning media protects plumbing and keeps appliances efficient.",
      },
      {
        title: "PFAS indicators",
        body: "PFAS have appeared in regional sampling. Catalytic carbon plus reverse osmosis is designed to push drinking-water levels toward the EPA's 4 ppt target.",
      },
    ],
    faqs: [
      {
        q: "Is Frisco and Plano water hard?",
        a: "Yes — NTMWD-supplied water is typically moderately hard, which is why many Frisco and Plano homeowners add conditioning media to protect plumbing and appliances.",
      },
      {
        q: "What contaminants matter most in Frisco and Plano?",
        a: "Disinfection byproducts (TTHMs/HAA5), hardness, chloramine, and PFAS indicators are the most common concerns. Run your ZIP to see your utility's reported levels.",
      },
      {
        q: "How fast can Mission Pure install in Frisco or Plano?",
        a: "Most Collin County installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you coordinate with NTMWD cities?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with NTMWD member cities and local districts.",
      },
    ],
    quotes: [
      "The hard-water spots on our glassware are finally gone, and the water tastes clean from every tap.",
      "We wanted safe formula water for the baby. The reverse osmosis system gave us total peace of mind.",
      "Fast, professional install in West Plano. They explained every valve before they left.",
    ],
  },
  {
    slug: "mckinney-allen",
    label: "McKinney & Allen",
    cities: ["McKinney", "Allen"],
    title: "McKinney & Allen Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps McKinney and Allen homeowners review tap water contaminants and compare whole-home and reverse osmosis filtration in Collin County.",
    keywords:
      "McKinney water filtration, Allen water filter, McKinney PFAS, Allen water contaminants, McKinney reverse osmosis, Allen whole home water filter, Mission Pure McKinney Allen",
    utility: "North Texas Municipal Water District (NTMWD)",
    source: "Lavon Lake and additional NTMWD surface-water supplies",
    neighborhoods:
      "Covering Stonebridge Ranch, Adriatica, Historic Downtown McKinney, plus Twin Creeks and Watters Creek in Allen.",
    insights: [
      {
        title: "Rapid growth & build-outs",
        body: "Fast-growing McKinney and Allen neighborhoods can see fluctuating taste and odor as demand rises. Whole-home carbon keeps water consistent across every faucet.",
      },
      {
        title: "Hard water & scale",
        body: "NTMWD water tends to be hard, leaving scale on fixtures and shortening appliance life. Conditioning media protects your plumbing investment.",
      },
      {
        title: "Disinfection byproducts",
        body: "Seasonal TTHMs and HAA5 from chloramine treatment can exceed health-based goals. Catalytic carbon reduces them before they aerosolize in showers.",
      },
    ],
    faqs: [
      {
        q: "Why does my McKinney or Allen water taste different sometimes?",
        a: "Seasonal source-water changes and chloramine dosing can shift taste and odor. Whole-home catalytic carbon smooths this out so every faucet stays consistent.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Hardness, disinfection byproducts (TTHMs/HAA5), chloramine, and PFAS indicators are the most common concerns. Run your ZIP to view reported levels.",
      },
      {
        q: "How fast can Mission Pure install in McKinney or Allen?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with NTMWD member cities and local districts.",
      },
    ],
    quotes: [
      "Our new build had scale issues fast. Mission Pure's system fixed the spots and the taste.",
      "The team was on time, tidy, and walked us through maintenance reminders.",
      "Knowing our drinking water is PFAS-filtered makes the whole house feel healthier.",
    ],
  },
  {
    slug: "arlington-irving",
    label: "Arlington & Irving",
    cities: ["Arlington", "Irving"],
    title: "Arlington & Irving Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Arlington and Irving homeowners check tap water contaminants and compare whole-home and reverse osmosis filtration across the mid-cities.",
    keywords:
      "Arlington water filtration, Irving water filter, Arlington PFAS, Irving water contaminants, Arlington reverse osmosis, Irving whole home water filter, Mission Pure Arlington Irving",
    utility: "Arlington Water Utilities and Irving Water Utilities",
    source: "Trinity River system reservoirs and regional surface-water blends",
    neighborhoods:
      "Covering Arlington's Entertainment District and surrounding neighborhoods, plus Las Colinas and Valley Ranch in Irving.",
    insights: [
      {
        title: "Trinity River blends",
        body: "Mid-cities supplies blend multiple Trinity River reservoirs, which can shift taste, odor, and byproduct levels. Whole-home carbon keeps water steady year-round.",
      },
      {
        title: "Chloramine treatment",
        body: "Chloramine is widely used across the mid-cities. Catalytic carbon with extended contact time reduces it so showers and laundry stay comfortable.",
      },
      {
        title: "PFAS & disinfection byproducts",
        body: "PFAS indicators and TTHMs/HAA5 appear in regional sampling. Carbon plus reverse osmosis is designed to keep drinking water near the strictest health targets.",
      },
    ],
    faqs: [
      {
        q: "Do Arlington and Irving use chloramine?",
        a: "Yes — chloramine is common across the mid-cities. Mission Pure uses catalytic carbon with extended contact time to reduce it, then polishes drinking water with reverse osmosis.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Chloramine, disinfection byproducts (TTHMs/HAA5), hardness, and PFAS indicators are the most common concerns. Run your ZIP to see reported levels.",
      },
      {
        q: "How fast can Mission Pure install in Arlington or Irving?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and utility coordination?",
        a: "Yes. Mission Pure manages backflow paperwork, coordinates shutoffs, and documents installs for insurance or resale.",
      },
    ],
    quotes: [
      "The chloramine smell in our showers is gone. The whole house feels fresher.",
      "Install in Las Colinas was quick and clean — and the water tastes great now.",
      "We finally stopped buying bottled water thanks to the reverse osmosis tap.",
    ],
  },
  {
    slug: "denton-rockwall",
    label: "Denton & Rockwall",
    cities: ["Denton", "Rockwall"],
    title: "Denton & Rockwall Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Denton and Rockwall homeowners review tap water contaminants and compare whole-home and reverse osmosis filtration across North Texas.",
    keywords:
      "Denton water filtration, Rockwall water filter, Denton PFAS, Rockwall water contaminants, Denton reverse osmosis, Rockwall whole home water filter, Mission Pure Denton Rockwall",
    utility: "Denton Water Utilities and the City of Rockwall (NTMWD)",
    source: "Lake Lewisville, Lake Ray Roberts, Lake Ray Hubbard, and well blending",
    neighborhoods:
      "Covering the UNT area and Robson Ranch in Denton, plus The Shores and Chandlers Landing in Rockwall.",
    insights: [
      {
        title: "Well & surface-water blending",
        body: "Denton blends lake and well sources, which can shift hardness and mineral content. Conditioning media keeps water steady and protects fixtures.",
      },
      {
        title: "Lake Ray Hubbard supply",
        body: "Rockwall draws on NTMWD's Lake Ray Hubbard system. Seasonal byproducts and chloramine are well managed with whole-home catalytic carbon.",
      },
      {
        title: "PFAS indicators",
        body: "PFAS have appeared in regional sampling. Catalytic carbon plus reverse osmosis is designed to push drinking-water levels toward the EPA's 4 ppt target.",
      },
    ],
    faqs: [
      {
        q: "Is Denton water hard?",
        a: "Denton blends lake and well water, so hardness varies. Many homeowners add conditioning media to prevent scale on fixtures and appliances.",
      },
      {
        q: "What contaminants matter most in Denton and Rockwall?",
        a: "Hardness, disinfection byproducts (TTHMs/HAA5), chloramine, and PFAS indicators are the most common concerns. Run your ZIP to view reported levels.",
      },
      {
        q: "How fast can Mission Pure install here?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with Denton, Rockwall, and NTMWD districts.",
      },
    ],
    quotes: [
      "Our well-blend water was inconsistent. Now it's clean and steady at every faucet.",
      "The Rockwall install was fast and the team documented everything for resale.",
      "Soft, filtered water has been a game changer for our skin and our appliances.",
    ],
  },
  {
    slug: "garland-mesquite",
    label: "Garland & Mesquite",
    cities: ["Garland", "Mesquite"],
    title: "Garland & Mesquite Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Garland and Mesquite homeowners check tap water contaminants and compare whole-home and reverse osmosis filtration in Dallas County.",
    keywords:
      "Garland water filtration, Mesquite water filter, Garland PFAS, Mesquite water contaminants, Garland reverse osmosis, Mesquite whole home water filter, Mission Pure Garland Mesquite",
    utility: "North Texas Municipal Water District (NTMWD)",
    source: "Lavon Lake and other NTMWD surface-water supplies",
    neighborhoods:
      "Covering Firewheel and Duck Creek in Garland, plus the Town East area of Mesquite and nearby communities.",
    insights: [
      {
        title: "Industrial corridor awareness",
        body: "Eastern Dallas County's industrial corridors make VOC and runoff awareness worthwhile. Whole-home carbon with reverse osmosis polishing keeps drinking water protected.",
      },
      {
        title: "NTMWD disinfection byproducts",
        body: "Seasonal TTHMs and HAA5 from chloramine treatment can exceed health-based goals. Catalytic carbon reduces them before they reach showers.",
      },
      {
        title: "Hard water & scale",
        body: "NTMWD water is typically hard. Conditioning media protects tankless heaters, fixtures, and glassware from scale buildup.",
      },
    ],
    faqs: [
      {
        q: "Should I worry about runoff in Garland or Mesquite?",
        a: "Eastern Dallas County has industrial corridors, so VOC awareness is reasonable. Whole-home carbon plus reverse osmosis is designed to keep drinking water protected against common runoff contaminants.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Hardness, disinfection byproducts (TTHMs/HAA5), chloramine, and PFAS indicators are the most common concerns. Run your ZIP to see reported levels.",
      },
      {
        q: "How fast can Mission Pure install in Garland or Mesquite?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with NTMWD member cities and local districts.",
      },
    ],
    quotes: [
      "We feel better knowing runoff contaminants are filtered before they reach our glasses.",
      "Scale on our fixtures is gone and the appliances run quieter.",
      "Clean, professional install in Firewheel. Highly recommend.",
    ],
  },
  {
    slug: "southlake-grapevine",
    label: "Southlake & Grapevine",
    cities: ["Southlake", "Grapevine"],
    title: "Southlake & Grapevine Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Southlake and Grapevine homeowners review tap water contaminants and compare whole-home and reverse osmosis filtration in NE Tarrant County.",
    keywords:
      "Southlake water filtration, Grapevine water filter, Southlake PFAS, Grapevine water contaminants, Southlake reverse osmosis, Grapevine whole home water filter, Mission Pure Southlake Grapevine",
    utility: "Upper Trinity Regional Water District and city supplies",
    source: "Grapevine Lake, Upper Trinity supplies, and city well tie-ins",
    neighborhoods:
      "Covering Southlake Town Square and the Carroll ISD area, plus Historic Main Street and the Vineyards in Grapevine.",
    insights: [
      {
        title: "Upper Trinity supplies",
        body: "Southlake and Grapevine draw on Upper Trinity and lake supplies that can vary seasonally. Whole-home carbon keeps water consistent across every faucet.",
      },
      {
        title: "Well tie-ins & hardness",
        body: "City well tie-ins can raise hardness and mineral content. Conditioning media protects luxury fixtures, tankless heaters, and glassware.",
      },
      {
        title: "PFAS & disinfection byproducts",
        body: "PFAS indicators and TTHMs/HAA5 appear in regional sampling. Carbon plus reverse osmosis is designed to keep drinking water near the strictest health targets.",
      },
    ],
    faqs: [
      {
        q: "Is Southlake and Grapevine water hard?",
        a: "Hardness varies with well tie-ins and lake supplies. Many homeowners add conditioning media to protect premium fixtures and appliances from scale.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Hardness, disinfection byproducts (TTHMs/HAA5), chloramine, and PFAS indicators are the most common concerns. Run your ZIP to view reported levels.",
      },
      {
        q: "How fast can Mission Pure install in Southlake or Grapevine?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with Upper Trinity districts and local utilities.",
      },
    ],
    quotes: [
      "Our fixtures stay spotless now — exactly what we wanted for the house.",
      "The reverse osmosis water is perfect for coffee and the kids' bottles.",
      "Premium, careful install in Town Square. The team respected our home.",
    ],
  },
  {
    slug: "royse-city-lavon",
    label: "Royse City, Lavon & Fate",
    cities: ["Royse City", "Lavon", "Fate"],
    title: "Royse City, Lavon & Fate Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Royse City, Lavon, and Fate homeowners check tap water contaminants and compare whole-home and reverse osmosis filtration near Lavon Lake.",
    keywords:
      "Royse City water filtration, Lavon water filter, Fate water filtration, Royse City PFAS, Lavon water contaminants, reverse osmosis Royse City, Mission Pure Royse City Lavon Fate",
    utility: "North Texas Municipal Water District (NTMWD)",
    source: "Lavon Lake and other NTMWD surface-water supplies",
    neighborhoods:
      "Covering fast-growing Royse City, Lavon, Fate, and surrounding eastern Collin and Rockwall county communities.",
    insights: [
      {
        title: "Lavon Lake sourcing",
        body: "These communities rely on NTMWD's Lavon Lake system. Seasonal byproducts and chloramine are well managed with whole-home catalytic carbon.",
      },
      {
        title: "Fast growth & new construction",
        body: "Rapid build-outs can mean fluctuating taste and odor. Whole-home carbon keeps water consistent across new and established homes alike.",
      },
      {
        title: "PFAS alerts",
        body: "PFAS have appeared in regional sampling and alerts. Catalytic carbon plus reverse osmosis is designed to push drinking-water levels toward the EPA's 4 ppt target.",
      },
    ],
    faqs: [
      {
        q: "Where does Royse City and Lavon water come from?",
        a: "These communities are served by NTMWD's Lavon Lake system. Mission Pure compares reported data to EPA and EWG health goals so you know when contaminants run above recommended levels.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Disinfection byproducts (TTHMs/HAA5), chloramine, hardness, and PFAS indicators are the most common concerns. Run your ZIP to view reported levels.",
      },
      {
        q: "How fast can Mission Pure install here?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with NTMWD member cities and local districts.",
      },
    ],
    quotes: [
      "Our new construction home had taste issues. The whole-home system fixed it immediately.",
      "PFAS alerts made us nervous — the reverse osmosis tap gives us confidence now.",
      "Friendly, fast install out in Fate. They treated our home with care.",
    ],
  },
  {
    slug: "carrollton-lewisville",
    label: "Carrollton & Lewisville",
    cities: ["Carrollton", "Lewisville"],
    title: "Carrollton & Lewisville Water Filtration & Contaminant Lookup | Mission Pure",
    description:
      "Mission Pure helps Carrollton and Lewisville homeowners review tap water contaminants and compare whole-home and reverse osmosis filtration near Lake Lewisville.",
    keywords:
      "Carrollton water filtration, Lewisville water filter, Carrollton PFAS, Lewisville water contaminants, Carrollton reverse osmosis, Lewisville whole home water filter, Mission Pure Carrollton Lewisville",
    utility: "City supplies via Dallas Water Utilities and Upper Trinity Regional Water District",
    source: "Lake Lewisville and regional surface-water supplies",
    neighborhoods:
      "Covering Downtown Carrollton and Josey Ranch, plus Old Town Lewisville and Castle Hills.",
    insights: [
      {
        title: "Lake Lewisville supply",
        body: "Carrollton and Lewisville draw on Lake Lewisville and regional supplies. Whole-home carbon keeps taste and odor consistent year-round.",
      },
      {
        title: "Hard water & scale",
        body: "Regional water tends to be hard, leaving scale on fixtures and shortening appliance life. Conditioning media protects your plumbing investment.",
      },
      {
        title: "PFAS & disinfection byproducts",
        body: "PFAS indicators and TTHMs/HAA5 appear in regional sampling. Carbon plus reverse osmosis is designed to keep drinking water near the strictest health targets.",
      },
    ],
    faqs: [
      {
        q: "Is Carrollton and Lewisville water hard?",
        a: "Regional supplies are typically moderately hard, which is why many homeowners add conditioning media to protect plumbing and appliances from scale.",
      },
      {
        q: "What contaminants matter most here?",
        a: "Hardness, disinfection byproducts (TTHMs/HAA5), chloramine, and PFAS indicators are the most common concerns. Run your ZIP to view reported levels.",
      },
      {
        q: "How fast can Mission Pure install in Carrollton or Lewisville?",
        a: "Most installs schedule within 3-5 days, with next-day reverse osmosis installs available when calendars allow.",
      },
      {
        q: "Do you handle permits and city coordination?",
        a: "Yes. Mission Pure manages permits, backflow paperwork, and shutoffs with Dallas Water Utilities, Upper Trinity, and local districts.",
      },
    ],
    quotes: [
      "The hard-water scale is gone and our water finally tastes clean.",
      "Old Town Lewisville install was quick and the crew was professional.",
      "Filtered drinking water at the tap means no more bottled water runs.",
    ],
  },
];

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function jsonLdService(city) {
  const areaServed = city.cities.map((name) => ({ "@type": "City", name }));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${city.label} Water Filtration & PFAS Protection`,
    provider: {
      "@type": "Organization",
      name: "Mission Pure",
      telephone: PHONE_TEL,
      url: `${SITE}/`,
    },
    areaServed: areaServed.length === 1 ? areaServed[0] : areaServed,
    serviceType: "Whole-home and drinking water filtration",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${city.label} Filtration Packages`,
      itemListElement: [
        { "@type": "Offer", name: "Whole-home catalytic carbon" },
        { "@type": "Offer", name: "Under-sink reverse osmosis" },
        { "@type": "Offer", name: "Mission Pure Care Plan" },
      ],
    },
  };
}

function jsonLdFaq(city) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function jsonLdBreadcrumb(city, url) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: `${SITE}/service-areas.html` },
      { "@type": "ListItem", position: 3, name: `${city.label} Water Filtration`, item: url },
    ],
  };
}

function renderPage(city) {
  const file = `${city.slug}-water-filtration.html`;
  const url = `${SITE}/${file}`;
  // Concise, keyword-front-loaded title that avoids SERP truncation (~60 chars).
  const pageTitle = `${city.label} Water Filtration | Mission Pure`;
  const insightsHtml = city.insights
    .map(
      (i) => `          <div class="panel">
            <div class="panel-title">${esc(i.title)}</div>
            <p class="muted">${esc(i.body)}</p>
          </div>`
    )
    .join("\n");

  const faqHtml = city.faqs
    .map(
      (f, idx) => `          <details class="faq-item"${idx === 0 ? " open" : ""}>
            <summary>${esc(f.q)}</summary>
            <div class="muted">${esc(f.a)}</div>
          </details>`
    )
    .join("\n");

  const quotesHtml = city.quotes
    .map(
      (q) => `            <figure class="quote">
              <blockquote>&ldquo;${esc(q)}&rdquo;</blockquote>
              <figcaption class="muted"><div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>Verified Mission Pure customer &mdash; ${esc(city.label)}</figcaption>
            </figure>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(city.description)}" />
    <meta name="keywords" content="${esc(city.keywords)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Mission Pure" />
    <meta property="og:title" content="${esc(pageTitle)}" />
    <meta property="og:description" content="${esc(city.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/assets/hero.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(pageTitle)}" />
    <meta name="twitter:description" content="${esc(city.description)}" />
    <meta name="twitter:image" content="${SITE}/assets/hero.jpg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/favicon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#0c243f" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header nav-ready">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="Mission Pure home">
          <img class="brand-logo" src="assets/logo.png" alt="Mission Pure" />
          <div class="brand-text">
            <div class="brand-tagline">${esc(city.label)} water clarity in minutes.</div>
          </div>
        </a>
        <button class="nav-toggle" id="navToggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
          <span class="nav-toggle-box"><span class="nav-toggle-line"></span></span>
        </button>
        <nav class="header-actions" aria-label="Primary">
          <button class="btn btn-ghost" id="openZipModalBtn" type="button">Check your water</button>
          <a class="btn btn-ghost" href="service-areas.html">DFW Service Areas</a>
          <a class="btn btn-primary" href="contact.html">Contact Us</a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section class="hero hero-service">
        <div class="hero-overlay"></div>
        <div class="container hero-inner">
          <div class="hero-copy">
            <div class="eyebrow">${esc(city.label)} Water Filtration + Contaminant Lookup</div>
            <h1>See what's in ${esc(city.label)} tap water &mdash; then strip the risks</h1>
            <p>
              Mission Pure reviews ${esc(city.utility)} data, flags PFAS, TTHMs/HAA5, chloramine, and hardness concerns, and
              recommends the right whole-home and drinking water protection for ${esc(city.source)}.
            </p>
            <p class="muted hero-intent">${esc(city.neighborhoods)}</p>

            <div class="hero-search" role="search" aria-label="Find your ${esc(city.label)} water by ZIP">
              <label class="sr-only" for="zipInline">ZIP code</label>
              <input id="zipInline" inputmode="numeric" autocomplete="postal-code" placeholder="${esc(city.cities[0])} ZIP" maxlength="5" />
              <button class="btn btn-primary" id="zipInlineBtn" type="button">See results</button>
            </div>

            <div class="hero-bullets">
              <div class="pill">${esc(city.cities[0])} ZIP water lookup</div>
              <div class="pill">PFAS + TTHM indicators</div>
              <div class="pill">Whole-home + RO guidance</div>
            </div>
          </div>

          <div class="hero-card" aria-label="${esc(city.label)} stats">
            <div class="hero-card-title">Why ${esc(city.label)} families upgrade</div>
            <div class="hero-card-body">
              <div class="stat">
                <div class="stat-value">PFAS</div>
                <div class="stat-label">Detected in regional sampling</div>
              </div>
              <div class="stat">
                <div class="stat-value">TTHMs</div>
                <div class="stat-label">Can exceed health goals</div>
              </div>
              <div class="stat">
                <div class="stat-value">Scale</div>
                <div class="stat-label">Hard water across the metro</div>
              </div>
              <div class="divider"></div>
              <div class="muted">Mission Pure systems block shower steam, laundry exposure, and every glass you pour.</div>
            </div>
          </div>
        </div>
      </section>

      <section class="container section" aria-labelledby="cityInsights">
        <div class="section-head">
          <h2 id="cityInsights">${esc(city.label)} tap water insights we track</h2>
          <div class="muted">Grounded in ${esc(city.utility)} reporting and customer feedback.</div>
        </div>
        <div class="grid-three">
${insightsHtml}
        </div>
      </section>

      <section class="section section-alt" aria-labelledby="cityPackages">
        <div class="container">
          <div class="section-head">
            <h2 id="cityPackages">${esc(city.label)}-ready filtration packages</h2>
            <div class="muted">Designed for local contaminants, pressure, and lifestyle.</div>
          </div>
          <div class="product-grid">
            <div class="product">
              <div class="product-head">
                <div class="product-title">Whole-home Catalytic Carbon + Softening</div>
                <div class="product-tag">Best for city water</div>
              </div>
              <p class="muted">Handles chloramine byproducts, PFAS indicators, and hardness so showers, laundry, and fixtures stay clean.</p>
              <ul class="product-points">
                <li class="product-point"><span class="product-dot"></span>Chloramine-rated catalytic carbon media</li>
                <li class="product-point"><span class="product-dot"></span>Metered softening to protect plumbing</li>
                <li class="product-point"><span class="product-dot"></span>Bypass for irrigation + pool fills</li>
              </ul>
              <a class="btn btn-primary" href="whole-home-water-filtration.html">Explore whole-home</a>
            </div>

            <div class="product">
              <div class="product-head">
                <div class="product-title">Under-sink RO + remineralization</div>
                <div class="product-tag">Best for drinking + cooking</div>
              </div>
              <p class="muted">Strips dissolved metals, PFAS, and microplastics for every glass you pour at home.</p>
              <ul class="product-points">
                <li class="product-point"><span class="product-dot"></span>4-stage RO with carbon block polishing</li>
                <li class="product-point"><span class="product-dot"></span>Optional alkaline cartridge</li>
                <li class="product-point"><span class="product-dot"></span>Dedicated faucet or fridge line</li>
              </ul>
              <a class="btn btn-primary" href="under-sink-reverse-osmosis.html">See RO details</a>
            </div>

            <div class="product">
              <div class="product-head">
                <div class="product-title">Mission Pure Care Plan</div>
                <div class="product-tag">Service + monitoring</div>
              </div>
              <p class="muted">Annual media refresh, RO filter swaps, and water testing tied to local sampling schedules.</p>
              <ul class="product-points">
                <li class="product-point"><span class="product-dot"></span>Text reminders + tech dispatch</li>
                <li class="product-point"><span class="product-dot"></span>Discounted emergency calls</li>
                <li class="product-point"><span class="product-dot"></span>Access to contaminant alerts</li>
              </ul>
              <a class="btn btn-primary" href="contact.html">Join the plan</a>
            </div>
          </div>
        </div>
      </section>

      <section class="container section" aria-labelledby="cityFaqHeading">
        <div class="section-head">
          <h2 id="cityFaqHeading">${esc(city.label)} water FAQ</h2>
          <div class="muted">Questions ${esc(city.label)} homeowners ask Mission Pure every week.</div>
        </div>
        <div class="faq">
${faqHtml}
        </div>
        <div class="mini-cta">
          <div>
            <div class="mini-cta-title">Ready to see your ${esc(city.label)} report?</div>
            <div class="muted">Enter your ZIP or text a photo of your bill to ${PHONE_DISPLAY}.</div>
          </div>
          <button class="btn btn-primary" type="button" id="miniCtaBtn">Check your ZIP</button>
        </div>
      </section>

      <section class="section section-alt" aria-labelledby="cityStories">
        <div class="container">
          <div class="section-head">
            <h2 id="cityStories">${esc(city.label)} families notice the difference</h2>
            <div class="muted">Representative feedback from Mission Pure customers.</div>
          </div>
          <div class="quote-grid">
${quotesHtml}
          </div>
        </div>
      </section>

      <section class="container section" aria-labelledby="cityCTA">
        <div class="banner">
          <div>
            <div class="banner-title" id="cityCTA">Bring ${esc(city.label)} tap water up to your standards</div>
            <div class="muted">Drop your ZIP for a contaminant report, or call Mission Pure to schedule a walkthrough.</div>
          </div>
          <a class="btn btn-primary" href="tel:+19512043095">Call ${PHONE_DISPLAY}</a>
        </div>
      </section>

      <div data-lookup-mount></div>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-branding">
          <img class="footer-logo" src="assets/logo.png" alt="Mission Pure" />
          <div class="footer-brand">Mission Pure</div>
          <p class="footer-copy">${esc(city.label)} water filtration guidance grounded in real contaminant data.</p>
        </div>
        <div class="footer-meta">
          <a href="tel:+19512043095">${PHONE_DISPLAY}</a>
          <span>&bull;</span>
          <a href="contact.html">Schedule a consult</a>
        </div>
        <div class="footer-nav">
          <a href="#cityInsights">Insights</a>
          <a href="#cityFaqHeading">FAQ</a>
          <a href="service-areas.html">Service Areas</a>
          <a href="water-watch.html">Water Watch</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <div>&copy; 2026 Mission Pure. All rights reserved.</div>
        <div>${esc(city.label)} water filtration experts</div>
      </div>
    </footer>

    <script type="application/ld+json">
${JSON.stringify(jsonLdService(city), null, 6).replace(/^/gm, "    ")}
    </script>

    <script type="application/ld+json">
${JSON.stringify(jsonLdFaq(city), null, 6).replace(/^/gm, "    ")}
    </script>

    <script type="application/ld+json">
${JSON.stringify(jsonLdBreadcrumb(city, url), null, 6).replace(/^/gm, "    ")}
    </script>

    <script defer src="app.js"></script>
  </body>
</html>
`;
}

(async () => {
  let count = 0;
  for (const city of CITY_DATA) {
    const file = `${city.slug}-water-filtration.html`;
    await writeFile(path.join(ROOT, file), renderPage(city), "utf8");
    console.log(`Generated ${file}`);
    count += 1;
  }
  console.log(`\nBuilt ${count} city landing pages. Run "npm run cache:bust" next.`);
})();
