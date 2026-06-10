const STORAGE_KEY = "missionPure.waterLookup";

const APP_BUILD = "202605310925";

const DATASET_URL = "data/water-data.json?v=202605310925";
const DFW_ZIP_MAP_URL = "data/zip-to-utilities-dfw.json?v=202605310925";
const CHEM_INFO_URL = "data/chemical-info.json?v=202605310925";

const ZIP_GEO_URL = "https://api.zippopotam.us/us/";
const TWDB_PWS_QUERY_URL =
  "https://services.twdb.texas.gov/arcgis/rest/services/PWS/Public_Water_Service_Areas/FeatureServer/0/query";

const UTILITIES_PROXY_URL = "api/lookup-utilities.php";
const EWG_PROXY_URL = "api/lookup-ewg.php";

const GUIDELINE_FALLBACKS = {
  "total trihalomethanes (tthms)": { value: 0.15, unit: "ppb" },
  "total haloacetic acids (haa5)": { value: 0.06, unit: "ppb" },
  chloroform: { value: 0.4, unit: "ppb" },
  bromodichloromethane: { value: 0.06, unit: "ppb" },
  dibromochloromethane: { value: 0.06, unit: "ppb" },
  bromoform: { value: 0.5, unit: "ppb" },
  lead: { value: 0.2, unit: "ppb" },
  copper: { value: 300, unit: "ppb" },
  arsenic: { value: 0.004, unit: "ppb" },
  "chromium (hexavalent)": { value: 0.02, unit: "ppb" },
  nitrate: { value: 0.14, unit: "ppm" },
  "nitrate (as n)": { value: 0.14, unit: "ppm" },
  nitrite: { value: 0.14, unit: "ppm" },
  "nitrite (as n)": { value: 0.14, unit: "ppm" },
  fluoride: { value: 0.5, unit: "ppm" },
  atrazine: { value: 0.1, unit: "ppb" },
  simazine: { value: 0.1, unit: "ppb" },
  "2,4-d": { value: 0.2, unit: "ppb" },
  glyphosate: { value: 0.1, unit: "ppb" },
  benzene: { value: 0.15, unit: "ppb" },
  "trichloroethylene (tce)": { value: 0.1, unit: "ppb" },
  "tetrachloroethylene (pce)": { value: 0.1, unit: "ppb" },
  "pfas (indicator)": { value: 0.004, unit: "ppt" },
  pfoa: { value: 0.004, unit: "ppt" },
  pfos: { value: 0.004, unit: "ppt" },
  chlorine: { value: 0.5, unit: "ppm" },
  chloramine: { value: 0.5, unit: "ppm" },
  chloramines: { value: 0.5, unit: "ppm" },
  sodium: { value: 20, unit: "ppm" },
  sulfate: { value: 250, unit: "ppm" },
  "total dissolved solids": { value: 500, unit: "ppm" },
  turbidity: { value: 0.3, unit: "NTU" },
  "total coliform bacteria": { value: 0.0, unit: "CFU/100mL" },
  barium: { value: 1, unit: "ppm" },
  aluminum: { value: 0.2, unit: "ppm" },
  manganese: { value: 0.1, unit: "ppm" },
  bromate: { value: 0.1, unit: "ppb" },
  "gross beta particle activity": { value: 4, unit: "pCi/L" },
  "total organic carbon": { value: 1, unit: "ppm" },
  "total chlorine residual": { value: 4, unit: "ppm" },
};

const NOVA_CALL_TEXT = "+1 (951) 204-3095";
const NOVA_CALL_TEL = "tel:+19512043095";
const NOVA_MAX_MISSES = 3;
const NOVA_GREETING_KEY = "nova:greeted";
const NOVA_DIALOGUES = [];
const NOVA_AVATAR_SRC = "assets/BotIcon.png?v=20260517-1353";
const NOVA_SUGGESTION_PRESETS = [
  "Check my ZIP status",
  "Schedule an install",
  "What contaminants matter?",
  "Show financing info",
  "How fast is installation?",
  "Whole-home vs under-sink"
];
const NOVA_MIN_MATCH_SCORE = 0.85;
// Below the confident threshold but plausible enough to offer as a clarifying guess.
const NOVA_CLARIFY_SCORE = 0.5;
const NOVA_PROACTIVE_DELAY = 4000;
const NOVA_STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "my",
  "your",
  "our",
  "is",
  "are",
  "was",
  "were",
  "be",
  "on",
  "in",
  "of",
  "with",
  "do",
  "does",
  "it",
  "that",
  "this",
  "between",
  "vs",
  "vs.",
  "what",
  "which",
  "about",
  "can",
  "you",
  "me",
  "i",
  "we",
]);

// Additive synonym/abbreviation expansion. The canonical phrase is APPENDED to
// the user's text before scoring (never replaces it), so common shorthand and
// alternate wording still matches existing intents without breaking originals.
const NOVA_SYNONYMS = {
  ro: "reverse osmosis",
  osmosis: "reverse osmosis",
  cost: "price",
  costs: "price",
  pricing: "price",
  prices: "price",
  priced: "price",
  quote: "price",
  quotes: "price",
  estimate: "price",
  expensive: "price",
  afford: "financing",
  payment: "financing",
  payments: "financing",
  finance: "financing",
  install: "installation",
  installs: "installation",
  installed: "installation",
  installing: "installation",
  setup: "installation",
  appointment: "schedule",
  book: "schedule",
  booking: "schedule",
  tthm: "tthms",
  thm: "tthms",
  pfoa: "pfas",
  pfos: "pfas",
  softener: "softening",
  soften: "softening",
  hardness: "hard water",
  human: "agent",
  rep: "agent",
  representative: "agent",
  zipcode: "zip",
};

// Canonical terms used for single-edit typo tolerance during scoring.
const NOVA_TYPO_TERMS = [
  "reverse",
  "osmosis",
  "filtration",
  "contaminant",
  "contaminants",
  "fluoride",
  "chlorine",
  "chloramine",
  "installation",
  "financing",
  "warranty",
  "schedule",
  "softening",
];

ensureLookupInfrastructure();

function ensureLookupInfrastructure() {
  if (typeof document === "undefined" || !document.body) return;

  if (!document.getElementById("zipModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal" id="zipModal" role="dialog" aria-modal="true" aria-labelledby="zipModalTitle" hidden>
        <div class="modal-backdrop" data-close="true"></div>
        <div class="modal-card" role="document">
          <div class="modal-head">
            <div>
              <div class="modal-title" id="zipModalTitle">Find what's in your water</div>
              <div class="muted">Enter ZIP, pick your utility, view detected chemicals.</div>
            </div>
            <button class="icon-btn" id="closeZipModalBtn" type="button" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <label class="label" for="zipInput">ZIP code</label>
              <input id="zipInput" inputmode="numeric" autocomplete="postal-code" placeholder="e.g. 75001" maxlength="5" />
              <div class="field-help muted" id="zipHelp">5 digits (US ZIP).</div>
            </div>

            <div class="form-row" id="utilityRow" hidden>
              <label class="label" for="utilitySelect">Nearest utility</label>
              <select id="utilitySelect">
                <option value="" selected disabled>Select your utility</option>
              </select>
              <div class="field-help muted" id="utilityHelp"></div>
            </div>

            <div class="form-actions">
              <button class="btn btn-ghost" id="resetModalBtn" type="button">Reset</button>
              <button class="btn btn-primary" id="modalPrimaryBtn" type="button">Find utilities</button>
            </div>

            <div class="modal-error" id="modalError" role="alert" hidden></div>
          </div>

          <div class="modal-foot">
            <div class="muted">Utilities: ZIP-based lookup (TX supported). Chemicals: Mission Pure dataset.</div>
          </div>
        </div>
      </div>
    `
    );
  }

function hydrateContactForm() {
  if (!els.contactZipField) return;
  const saved = loadState();
  if (saved?.zip && !els.contactZipField.value) {
    els.contactZipField.value = saved.zip;
  }
}

function handleContactSubmit(event) {
  event.preventDefault();
  if (!els.contactForm || !els.contactAutoResponse) return;

  const payload = {
    name: els.contactNameField?.value?.trim(),
    email: els.contactEmailField?.value?.trim(),
    phone: els.contactPhoneField?.value?.trim(),
    zip: sanitizeZip(els.contactZipField?.value),
    project: els.contactProjectField?.value,
    timeline: els.contactTimelineField?.value,
    details: els.contactDetailsField?.value?.trim(),
  };

  if (!payload.name || !isValidEmail(payload.email || "")) {
    const target = !payload.name ? els.contactNameField : els.contactEmailField;
    target?.focus();
    return;
  }

  showContactSummary(payload);
  sendContactAutoreply(payload);
}

function showContactSummary(payload) {
  if (!els.contactAutoResponse || !els.contactSummaryList) return;
  const summaryItems = [
    payload.project ? `Project: ${payload.project}` : null,
    payload.timeline ? `Timeline: ${payload.timeline}` : null,
    payload.zip ? `ZIP: ${payload.zip}` : null,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.details ? `Notes: ${payload.details}` : null,
  ].filter(Boolean);

  els.contactSummaryList.innerHTML = summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.contactAutoResponseText.textContent = `Thanks ${payload.name?.split(" ")[0] || "there"}, we logged your request and routed it to Joe.`;
  els.contactAutoResponseTitle.textContent = payload.timeline?.includes("ASAP")
    ? "Priority ticket created"
    : "We’re slotting your install window.";
  els.contactFollowupNote.textContent = `Expect a response at ${formatContactSLA(payload.timeline)}. For urgent needs call +1 (951) 204-3095.`;
  els.contactMailtoLink.href = buildContactMailto(payload);
  els.contactAutoResponse.hidden = false;
  els.contactAutoResponse.scrollIntoView({ behavior: "smooth", block: "center" });
  els.contactAutoResponse.dataset.summary = summaryItems.join("\n");
}

function copyContactSummary() {
  const summary = els.contactAutoResponse?.dataset?.summary;
  if (!summary) return;
  navigator.clipboard?.writeText(summary).catch(() => {});
}

function buildContactMailto(payload) {
  const subject = encodeURIComponent(`Mission Pure request – ${payload.project || "Water filtration"}`);
  const lines = [
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Phone: ${payload.phone || ""}`,
    `ZIP: ${payload.zip || ""}`,
    `Timeline: ${payload.timeline || ""}`,
    `Project: ${payload.project || ""}`,
    "",
    payload.details || ""
  ].join("\n");
  return `mailto:joe@mission-pure.com?subject=${subject}&body=${encodeURIComponent(lines)}`;
}

function formatContactSLA(timeline) {
  if (!timeline) return "7 AM tomorrow";
  if (timeline.includes("ASAP")) return "the next 30 minutes";
  if (timeline.includes("week")) return "this afternoon";
  return "within 12 hours";
}

async function sendContactAutoreply(payload) {
  const body = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    zip: payload.zip,
    project: payload.project,
    timeline: payload.timeline,
    details: payload.details,
    submittedAt: new Date().toISOString(),
  };
  try {
    await fetch("https://formspree.io/f/mqaklrdp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      mode: "cors",
    });
  } catch (err) {
    console.warn("contact webhook failed", err);
  }
}

  if (!document.getElementById("chemicalModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal" id="chemicalModal" role="dialog" aria-modal="true" aria-labelledby="chemicalModalTitle" hidden>
        <div class="modal-backdrop" data-close="true"></div>
        <div class="modal-card" role="document">
          <div class="modal-head">
            <div>
              <div class="modal-title" id="chemicalModalTitle"></div>
              <div class="muted" id="chemicalModalSubtitle"></div>
            </div>
            <button class="icon-btn" id="closeChemicalModalBtn" type="button" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" id="chemicalModalBody"></div>
        </div>
      </div>
    `
    );
  }

  if (!document.getElementById("resultsShell")) {
    const mount = document.querySelector("[data-lookup-mount]") || document.getElementById("main") || document.body;
    mount.insertAdjacentHTML(
      "beforeend",
      `
      <section class="container section" aria-labelledby="resultsHeading">
        <div class="section-head">
          <h2 id="resultsHeading">Your water results</h2>
          <div class="section-actions">
            <button class="btn btn-ghost" id="changeLocationBtn" type="button">Change ZIP / utility</button>
          </div>
        </div>

        <div class="results-shell" id="resultsShell">
          <div class="results-empty" id="resultsEmpty">
            <div class="results-empty-title">Start with your ZIP code</div>
            <div class="muted">We'll find your utility and show detected chemicals.</div>
            <button class="btn btn-primary" id="startBtn" type="button">Enter ZIP</button>
          </div>

          <div class="results" id="results" hidden>
            <div class="results-meta" id="resultsMeta"></div>

            <div class="grid-two">
              <div class="panel">
                <div class="panel-title">Contaminants Detected</div>
                <div class="panel-subtitle muted" id="chemicalsSubtitle"></div>
                <div class="chem-cards" id="chemCards" hidden></div>
                <div class="table-wrap">
                  <table class="table" aria-label="Detected chemicals" id="chemTable">
                    <thead>
                      <tr>
                        <th scope="col">Chemical</th>
                        <th scope="col">Category</th>
                        <th scope="col">Potential concerns</th>
                        <th scope="col">Level</th>
                      </tr>
                    </thead>
                    <tbody id="chemTableBody"></tbody>
                  </table>
                </div>
              </div>

              <div class="panel" id="shop">
                <div class="panel-title">Recommended next step</div>
                <div class="panel-subtitle muted">Match filtration to what's in your water.</div>

                <div class="cta">
                  <div class="cta-title">Find the right filter for your home</div>
                  <div class="cta-body muted">
                    Based on your results, we'll recommend a system for showering, cooking, and drinking.
                  </div>
                  <a class="btn btn-primary" href="whole-home-water-filtration.html">View filtration options</a>
                </div>

                <div class="cards">
                  <a class="card" href="whole-home-water-filtration.html">
                    <div class="card-title">Whole-home protection</div>
                    <div class="card-body muted">Great for shower + laundry + dishes</div>
                  </a>
                  <a class="card" href="under-sink-reverse-osmosis.html">
                    <div class="card-title">Under-sink</div>
                    <div class="card-body muted">Targeted drinking + cooking</div>
                  </a>
                  <a class="card" href="whole-home-water-filtration.html#shower">
                    <div class="card-title">Bath & shower</div>
                    <div class="card-body muted">Protect skin, hair, and steam</div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="notice" id="notice" hidden role="status" aria-live="polite"></div>
        </div>
      </section>
    `
    );
  }
}

function registerNovaDialogue(keywords, response, options = {}) {
  const normalizedKeywords = Array.isArray(keywords)
    ? keywords
        .filter((k) => typeof k === "string" && k.trim().length > 0)
        .map((k) => k.toLowerCase())
    : [];
  NOVA_DIALOGUES.push({
    keywords: normalizedKeywords,
    response,
    action: options.action,
    actionPayload: options.actionPayload,
    matcher: typeof options.matcher === "function" ? options.matcher : null,
    allowHtml: Boolean(options.allowHtml),
  });
}

function novaNormalizeText(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function novaTokenize(normalized) {
  if (!normalized) return [];
  return normalized
    .split(" ")
    .filter((token) => token && !NOVA_STOPWORDS.has(token));
}

// Append canonical synonyms for any shorthand the user typed, so existing
// keyword intents still match. Additive only — original wording is preserved.
function novaExpandSynonyms(normalized) {
  if (!normalized) return normalized;
  const extra = [];
  for (const token of normalized.split(" ")) {
    const canonical = NOVA_SYNONYMS[token];
    if (canonical && !normalized.includes(canonical)) {
      extra.push(canonical);
    }
  }
  return extra.length ? `${normalized} ${extra.join(" ")}` : normalized;
}

// Bounded Levenshtein distance (early-exits once it exceeds `max`).
function novaEditDistance(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

// True if any input token is the keyword token or a single-edit typo of it.
function novaTokenMatches(kwToken, tokenSet) {
  if (tokenSet.has(kwToken)) return 1;
  if (kwToken.length >= 5 && NOVA_TYPO_TERMS.includes(kwToken)) {
    for (const token of tokenSet) {
      if (token.length >= 4 && novaEditDistance(token, kwToken, 1) <= 1) {
        return 0.9;
      }
    }
  }
  return 0;
}

function novaScoreEntry(entry, normalized, tokenSet) {
  let score = 0;
  if (entry.matcher && entry.matcher(normalized)) {
    score += 5;
  }

  entry.keywords.forEach((kw) => {
    if (!kw) return;
    if (normalized.includes(kw)) {
      score += Math.min(kw.length / Math.max(normalized.length, 1), 1) + 0.6;
      return;
    }
    const kwTokens = kw.split(" ").filter(Boolean);
    if (kwTokens.length === 0) return;
    let overlaps = 0;
    kwTokens.forEach((token) => {
      overlaps += novaTokenMatches(token, tokenSet);
    });
    score += overlaps / kwTokens.length;
  });

  return score;
}

function findNovaMatch(rawInput) {
  const normalized = novaExpandSynonyms(novaNormalizeText(rawInput));
  const tokens = new Set(novaTokenize(normalized));
  let best = { entry: null, score: 0 };

  for (const entry of NOVA_DIALOGUES) {
    const entryScore = novaScoreEntry(entry, normalized, tokens);
    if (entryScore > best.score) {
      best = { entry, score: entryScore };
    }
  }

  return best;
}

function initNova() {
  if (novaInitialized) return;
  const container = document.createElement("div");
  container.className = "nova-chat";
  container.innerHTML = `
    <button class="nova-toggle" id="novaToggle" type="button" aria-label="Open chat with Nova">
      <img src="${NOVA_AVATAR_SRC}" alt="" />
    </button>
    <div class="nova-panel" id="novaPanel" role="dialog" aria-modal="false" aria-labelledby="novaTitle" hidden>
      <div class="nova-panel-head">
        <div class="nova-panel-id">
          <div class="nova-avatar" aria-hidden="true">
            <img src="${NOVA_AVATAR_SRC}" alt="" />
          </div>
          <div>
            <div class="nova-name" id="novaTitle">Nova</div>
            <div class="nova-status">Mission Pure assistant</div>
          </div>
        </div>
        <button class="nova-close" id="novaClose" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="nova-messages" id="novaMessages"></div>
      <div class="nova-suggestions" id="novaSuggestions" aria-label="Suggested prompts"></div>
      <form class="nova-form" id="novaForm" autocomplete="off">
        <label for="novaInput" class="sr-only">Message Nova</label>
        <input class="nova-input" id="novaInput" name="message" placeholder="Ask Nova anything…" />
        <button class="nova-send" type="submit">Send</button>
      </form>
      <footer>
        Nova is a friendly assistant for Mission Pure water guidance.
      </footer>
    </div>
  `;
  document.body.appendChild(container);

  els.novaToggle = container.querySelector("#novaToggle");
  els.novaPanel = container.querySelector("#novaPanel");
  els.novaMessages = container.querySelector("#novaMessages");
  els.novaSuggestions = container.querySelector("#novaSuggestions");
  els.novaForm = container.querySelector("#novaForm");
  els.novaInput = container.querySelector("#novaInput");
  els.novaClose = container.querySelector("#novaClose");
  novaInitialized = true;

  // Seed suggestions
  renderNovaSuggestions(NOVA_SUGGESTION_PRESETS);
}

function renderNovaSuggestions(list) {
  if (!els.novaSuggestions) return;
  els.novaSuggestions.innerHTML = "";
  list.forEach((preset) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "nova-suggestion";
    chip.textContent = preset;
    chip.addEventListener("click", () => submitNovaText(preset));
    els.novaSuggestions.appendChild(chip);
  });
  els.novaSuggestions.hidden = false;
  novaSuggestionsDismissed = false;
}

function toggleNova() {
  if (els.novaPanel?.hidden) {
    openNova();
  } else {
    closeNova();
  }
}

function openNova() {
  if (!els.novaPanel) return;
  if (novaProactiveTimer) {
    window.clearTimeout(novaProactiveTimer);
    novaProactiveTimer = null;
  }
  els.novaPanel.hidden = false;
  els.novaPanel.parentElement?.classList.add("is-open");
  els.novaInput?.focus();
  novaMaybeAutogreet();
}

function closeNova() {
  if (!els.novaPanel) return;
  els.novaPanel.hidden = true;
  els.novaPanel.parentElement?.classList.remove("is-open");
  try {
    localStorage.setItem("nova:proactive-dismissed", "true");
  } catch {
    // ignore
  }
}

function novaMaybeAutogreet() {
  if (novaHasGreeted) return;
  const greeted = localStorage.getItem(NOVA_GREETING_KEY);
  if (greeted) {
    novaHasGreeted = true;
    return;
  }
  novaHasGreeted = true;
  localStorage.setItem(NOVA_GREETING_KEY, "true");
  pushNovaMessage("Nova", "Hi there—I'm Nova. Need help checking water results or picking a filtration plan?");
}

function scheduleNovaProactiveGreeting() {
  if (novaProactiveTimer || novaHasGreeted) return;
  if (localStorage.getItem("nova:proactive-dismissed")) return;
  novaProactiveTimer = window.setTimeout(() => {
    openNova();
    novaProactiveTimer = null;
  }, NOVA_PROACTIVE_DELAY);
}

function handleNovaSubmit(event) {
  event.preventDefault();
  const value = els.novaInput?.value?.trim();
  if (!value) return;
  submitNovaText(value);
  els.novaInput.value = "";
}

function dismissNovaSuggestions() {
  if (novaSuggestionsDismissed) return;
  novaSuggestionsDismissed = true;
  if (els.novaSuggestions) {
    els.novaSuggestions.innerHTML = "";
    els.novaSuggestions.hidden = true;
  }
}

function submitNovaText(text) {
  dismissNovaSuggestions();
  pushNovaMessage("user", text);
  if (els.novaInput) {
    els.novaInput.value = "";
  }

  // Any bare 5-digit ZIP should jump straight into the lookup, even if it
  // isn't one of the pre-registered example ZIPs.
  const zipMatch = String(text).match(/\b(\d{5})\b/);
  if (zipMatch && !/\d{6,}/.test(text)) {
    novaMissCount = 0;
    pushNovaMessage("Nova", `Got it — pulling up the ZIP lookup for ${zipMatch[1]} so you can see local utilities and contaminants.`);
    handleNovaAction("openZip", { zip: zipMatch[1] });
    return;
  }

  const { entry, score } = findNovaMatch(text);

  if (entry && score >= NOVA_MIN_MATCH_SCORE) {
    novaMissCount = 0;
    const reply = typeof entry.response === "function" ? entry.response(text) : entry.response;
    pushNovaMessage("Nova", reply, { allowHtml: entry.allowHtml });
    if (entry.action) {
      const payload = typeof entry.actionPayload === "function" ? entry.actionPayload(text) : entry.actionPayload;
      handleNovaAction(entry.action, payload);
    }
    return;
  }

  novaMissCount += 1;
  if (novaMissCount >= NOVA_MAX_MISSES) {
    pushNovaMessage(
      "Nova",
      `I want to make sure you get a perfect answer. Let me connect you with Mission Pure directly. Call us at ${NOVA_CALL_TEXT} or tap below. <a class="nova-call-btn" href="${NOVA_CALL_TEL}">Call Mission Pure</a>`,
      { allowHtml: true }
    );
    novaMissCount = 0;
    return;
  }

  // Near miss: we have a plausible-but-uncertain candidate, so offer it as a
  // clarifying question instead of a flat "I don't know".
  if (entry && score >= NOVA_CLARIFY_SCORE) {
    const reply = typeof entry.response === "function" ? entry.response(text) : entry.response;
    pushNovaMessage("Nova", "I think you're asking about this — let me know if I'm off base:");
    pushNovaMessage("Nova", reply, { allowHtml: entry.allowHtml });
    renderNovaSuggestions(NOVA_SUGGESTION_PRESETS);
    return;
  }

  pushNovaMessage(
    "Nova",
    "I'm still training on that exact topic, but I can help with ZIP lookups, contaminant explanations, install timelines, financing, or I can connect you with our human team. Pick one below or rephrase and I'll jump in!"
  );
  renderNovaSuggestions(NOVA_SUGGESTION_PRESETS);
}

function pushNovaMessage(author, text, options = {}) {
  if (!els.novaMessages) return;
  const row = document.createElement("div");
  row.className = "nova-message";
  if (author === "user") row.classList.add("is-user");

  const avatar = document.createElement("div");
  avatar.className = "nova-avatar";

  const bubble = document.createElement("div");
  bubble.className = "nova-bubble";
  if (author === "user" || !options.allowHtml) {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = text;
  }

  if (author !== "user") {
    const img = document.createElement("img");
    img.src = NOVA_AVATAR_SRC;
    img.alt = "";
    avatar.appendChild(img);
    row.appendChild(avatar);
  }
  row.appendChild(bubble);
  els.novaMessages.appendChild(row);
  els.novaMessages.scrollTop = els.novaMessages.scrollHeight;
}

function handleNovaAction(action, payload) {
  switch (action) {
    case "openZip":
      if (payload && typeof payload === "object" && payload.zip) {
        openModal({ zip: payload.zip });
      } else {
        openModal();
      }
      pushNovaMessage("Nova", "Opening the ZIP lookup so you can run results.");
      break;
    case "goContact":
      window.location.href = "contact.html";
      break;
    case "callUs":
      try {
        window.location.href = NOVA_CALL_TEL;
      } catch {
        // ignore navigation errors
      }
      break;
    default:
      break;
  }
}

(function seedNovaKnowledgeBase() {
  const basePairs = [
    { keywords: ["hello", "hi", "hey", "greetings", "good morning", "good evening"], response: "Hi there! I'm Nova, Mission Pure's virtual teammate. Ask me about water results, filters, or booking a visit." },
    { keywords: ["who are you", "nova", "mission pure bot"], response: "I'm Nova, a guided assistant for Mission Pure. I help DFW families understand water results and connect them with our install team." },
    { keywords: ["hours", "when are you open", "availability"], response: "Mission Pure takes calls 7 days a week from 8am-8pm, and we offer evening consults by request." },
    { keywords: ["contact", "phone", "call", "talk to someone"], response: `You can reach our team at ${NOVA_CALL_TEXT}. Want me to connect you now?` },
    {
      keywords: ["book", "schedule", "appointment", "consult"],
      response: `Let's lock in your install. Our scheduler can grab a time while you're on the line—call ${NOVA_CALL_TEXT} or tap below and we'll confirm it together. <a class="nova-call-btn" href="${NOVA_CALL_TEL}">Call Mission Pure</a>`,
      options: { allowHtml: true, action: "callUs" },
    },
    { keywords: ["quote", "price", "cost"], response: "Whole-home systems usually start around the mid-$3k range installed, while under-sink RO setups are a fraction of that. Exact pricing depends on plumbing layout and contaminant levels." },
    { keywords: ["finance", "financing", "payment options", "monthly"], response: "Mission Pure offers flexible financing with zero-interest promo terms for qualified customers. We can review exact payment options during your consult." },
    { keywords: ["warranty", "guarantee"], response: "Puronics systems include industry-leading warranties on media tanks, electronics, and workmanship. We'll register everything for you after install." },
    { keywords: ["lead time", "how long", "timeline"], response: "Most installs happen within 2-4 business days after you approve the plan. Emergency slots are often available for nursery or medical needs." },
    { keywords: ["google reviews", "rating", "5 star"], response: "Mission Pure holds consistent 5-star reviews across Dallas-Fort Worth. We pair data-backed guidance with licensed Puronics installs." },
    { keywords: ["puro", "puronics"], response: "Yes—Mission Pure is a licensed Puronics dealer. That means factory-authorized equipment, validated media, and support across the entire DFW metro." },
    { keywords: ["greeting", "how are you"], response: "Doing great and ready to help! What would you like to know about water quality or filtration?" },
  ];
  basePairs.forEach((pair) => registerNovaDialogue(pair.keywords, pair.response, pair.options));

  const smallTalk = [
    { keywords: ["thank", "thanks", "thx", "appreciate"], response: "You're welcome! Anything else you'd like to know about your water?" },
    { keywords: ["good job", "awesome", "great", "perfect"], response: "Glad that helped! Want to look at your ZIP or compare systems next?" },
    { keywords: ["nice", "cool", "sweet"], response: "Right? Mission Pure nerds out on this stuff all day. What should we dive into now?" },
    { keywords: ["who built you", "who made you", "what are you"], response: "Mission Pure's team trained me on DFW water data so I can guide families toward the right filtration plan." },
    { keywords: ["how old", "birthday", "age"], response: "I'm brand-new but learning quickly from every conversation." },
    { keywords: ["joke", "funny"], response: "Water nerd joke: why did the contaminant get kicked out of the tap? Because it couldn't conduct itself properly." },
    { keywords: ["favorite", "love"], response: "I love when families see their results and feel confident about next steps. Data + action is my happy place." },
    { keywords: ["busy", "you there"], response: "Still here! Just lining up your info. What else can I answer?" },
    { keywords: ["bye", "goodbye", "see ya"], response: "Talk soon! If you need anything later, just open Nova again." },
    { keywords: ["human", "real person"], response: "I'm a virtual assistant, but if you ever need a human we can hop on the phone right away." },
  ];
  smallTalk.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const serviceAreas = [
    "Dallas",
    "Fort Worth",
    "Plano",
    "Frisco",
    "McKinney",
    "Allen",
    "Garland",
    "Mesquite",
    "Irving",
    "Arlington",
    "Denton",
    "Rockwall",
    "Southlake",
    "Grapevine",
    "Carrollton",
    "Lewisville",
    "Prosper",
    "Celina",
    "Keller",
    "Flower Mound",
    "Richardson",
    "Rowlett",
    "Wylie",
    "Grand Prairie",
    "Coppell",
    "Hurst",
    "Euless",
    "Bedford",
    "Weatherford",
    "Royse City",
    "Lavon",
    "Sachse",
    "Murphy",
    "Highland Village",
    "Little Elm",
    "Anna",
    "The Colony"
  ];
  serviceAreas.forEach((area) => {
    const lower = area.toLowerCase();
    registerNovaDialogue(
      [lower, `${lower} service`, `do you serve ${lower}`, `${lower} water`, `${lower} install`],
      `Yes—Mission Pure is active in ${area}. We can pull contaminant data for your ZIP and schedule a licensed installer there.`
    );
  });

  registerNovaDialogue(
    [
      "should i get a filter",
      "do i need a filter",
      "need a water filter",
      "do i need filtration",
      "should i install a filter",
      "is filtration worth it",
      "should i get a water filter",
      "do i need a water filter",
      "should we get a filter",
      "should we get a water filter",
      "is a filter necessary",
    ],
    "Yes—Mission Pure installs filters because lab data shows PFAS, TTHMs/HAA5, and chloramine are routinely above health-based targets across Dallas/Fort Worth. Whole-home catalytic carbon keeps those chemicals out of showers, protects lungs/skin, and stops scale so fixtures and appliances last. Under-sink RO polishes drinking water so bottles, coffee, and ice stay metal-free. Families notice calmer allergies, better taste, and a higher home resale story within days. Drop your ZIP and I’ll pull your contaminant list so you can see why we say ‘yes’ every time."
  );

  registerNovaDialogue(
    [
      "i'll buy",
      "i will buy",
      "ready to buy",
      "sign me up",
      "let's do it",
      "okay i'll buy",
      "im ready",
      "let's install",
      "schedule me",
      "book me",
      "let's book",
    ],
    `Amazing—I'll lock this in for you. Share your ZIP and preferred install window so I can queue the contaminant report, or call ${NOVA_CALL_TEXT} now and I'll alert our scheduler you're ready. Either way, we'll finalize the plan and get your system registered today.`
  );

  registerNovaDialogue(
    [
      "how do i know what's in my water",
      "how do i find out what's in my water",
      "find out what's in my water",
      "what's in my water",
      "tell me what's in my water",
      "check my water",
      "how do i know whats in my water",
      "how do i find out whats in my water",
      "find out whats in my water",
      "whats in my water",
      "tell me whats in my water",
    ],
    "Enter your ZIP and I'll pull the contaminant list for your specific utility—want me to open the lookup tool so you can drop it in?",
    { action: "openZip" }
  );

  const waterQualityQuestions = [
    {
      keywords: ["how bad", "how bad is my water", "water bad", "bad water", "water quality", "quality of my water", "side effects", "health risk"],
      response:
        "I'll calculate health-guideline ratios so you can see severity. PFAS above 1x guideline link to thyroid drift, high cholesterol, immune suppression, and certain cancers. TTHMs/HAA5 raise bladder/colon cancer risk, while nitrates stress blood oxygen and kidneys. I'll flag whichever contaminants are driving the risk so you know where filtration should focus.",
    },
    {
      keywords: ["how bad for kids", "kids safe", "children", "babies", "infant", "for my child"],
      response:
        "Kids absorb more contaminants per pound. Lead and manganese affect brain development, PFAS dull vaccine response, nitrates can trigger blue-baby syndrome, and chloramine can inflame eczema/asthma. I'll show the ratios plus the gear that keeps nurseries and school-age kids protected.",
    },
    {
      keywords: ["is my water safe", "water safe", "can i drink", "safe to drink", "drink it"],
      response:
        "Safety changes by contaminant. I compare your utility data to EPA MCLs plus tighter medical advisories (EWG, CDC, ATSDR) so you know if you're under, at, or multiples above guidance for drinking, showering, and cooking.",
    },
    {
      keywords: ["what contaminants matter", "which contaminants matter", "important contaminants", "top contaminants"],
      response:
        "DFW hot spots include PFAS (thyroid + immune), TTHMs/HAA5 (carcinogenic byproducts), chloramine/chlorine (respiratory + skin irritation), heavy metals like lead/copper (neurological + kidney stress), and nitrates (oxygen transport issues). I'll call out whichever are elevated in your ZIP and pair them with treatment steps.",
    },
    {
      keywords: ["need help", "help me", "what can you do"],
      response:
        "I can interpret the contaminant list, translate health impacts, compare whole-home vs RO, advise on maintenance schedules, and connect you to Mission Pure humans for next steps.",
    },
    {
      keywords: ["explain results", "reading results", "understand report", "long term issues"],
      response:
        "Each contaminant card shows concentration, unit, and how many times it exceeds a health guideline. I reference EPA + medical advisories so you know which contaminants tie to cancer risk, thyroid disruption, neurological effects, or skin/respiratory irritation. Ask me about any chemical and I'll translate the likely outcomes.",
    },
  ];
  waterQualityQuestions.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  registerNovaDialogue(
    [
      "chemicals in my area",
      "contaminants in my area",
      "chemicals nearby",
      "what chemicals are in my water",
      "list contaminants",
      "which contaminants are here",
    ],
    "Pop in your ZIP and I'll pull the utility's contaminant list with health-guideline ratios. Want me to open the lookup tool for you?",
    { action: "openZip" }
  );

  registerNovaDialogue(
    [],
    "On it—opening the ZIP lookup so you can plug that in.",
    {
      matcher: (input) => {
        const norm = novaNormalizeText(input);
        if (!norm) return false;
        const positives = new Set([
          "yes",
          "yea",
          "yeah",
          "yep",
          "yup",
          "yas",
          "ya",
          "sure",
          "sure thing",
          "ok",
          "okay",
          "sounds good",
          "do it",
          "please do",
          "go ahead",
        ]);
        return positives.has(norm);
      },
      action: "openZip",
    }
  );

  registerNovaDialogue(
    [],
    (raw) => {
      const zip = String(raw || "")
        .trim()
        .replace(/[^0-9]/g, "")
        .slice(0, 5);
      if (zip) {
        return `Great—I'll open the lookup so you can plug in ${zip} and pick your utility for real contaminant data.`;
      }
      return "Opening the lookup so you can plug that ZIP in.";
    },
    {
      matcher: (input) => /^(?:\s*)\d{5}(?:\s*)$/.test(String(input || "")),
      action: "openZip",
      actionPayload: (raw) => {
        const zip = String(raw || "").replace(/[^0-9]/g, "").slice(0, 5);
        return zip && zip.length === 5 ? { zip } : null;
      },
    }
  );

  const healthImpactFAQs = [
    {
      keywords: ["cancer", "carcinogen", "tumor", "oncology"],
      response:
        "Disinfection byproducts (TTHMs/HAA5), hexavalent chromium, benzene, and certain PFAS have documented links to elevated bladder, colon, kidney, and liver cancer risk across long-term exposure. Mission Pure tracks how far each sits above health-advisory limits and sizes catalytic carbon + RO so carcinogenic precursors are stripped before they reach you.",
    },
    {
      keywords: ["thyroid", "endocrine", "hormone"],
      response:
        "PFAS, nitrate, perchlorate, and some solvents interfere with thyroid hormone production. Symptoms often include fatigue, metabolism changes, and temperature swings. By combining high-capacity carbon, anion exchange, and RO polishing, we target the compounds most associated with endocrine disruption.",
    },
    {
      keywords: ["autoimmune", "immune", "immunocompromised", "immune system"],
      response:
        "PFAS, lead, and manganese exposures have been tied to weakened immune response and flare-ups for autoimmune conditions. Whole-home catalytic carbon keeps shower inhalation exposure low, while RO finishes drinking water so your immune system isn't fighting chronic triggers.",
    },
    {
      keywords: ["neurological", "brain", "memory", "adhd"],
      response:
        "Lead, manganese, and organic solvents affect cognition, attention, and fine-motor development. Mission Pure maps those contaminants per ZIP and layers particulate filtration + RO to keep neurotoxic metals out of both cooking and bathing water.",
    },
    {
      keywords: ["kidney", "renal", "liver", "detox"],
      response:
        "PFAS, TTHMs, and disinfection byproducts accumulate in the liver, while nitrates, uranium, and heavy metals stress kidneys. We'll highlight any elevated ratios and spec media (anion exchange, carbon, RO membranes) that relieve the detox load on your organs.",
    },
    {
      keywords: ["skin", "rash", "eczema", "psoriasis"],
      response:
        "Chloramine, chlorine, and hardness roughen the skin barrier and worsen eczema/psoriasis. Whole-home catalytic carbon plus conditioning softens shower water so flare-ups calm down, and we can add vitamin-C inline filters if dermatologists recommend it.",
    },
    {
      keywords: ["respiratory", "asthma", "breathing"],
      response:
        "Vaporized chloramine/chlorine in showers can inflame airways for asthma sufferers, and VOCs or mold byproducts exacerbate breathing issues. Whole-home filtration strips the irritants before they aerosolize so each shower feels neutral.",
    },
  ];
  healthImpactFAQs.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const vulnerableGroupNotes = [
    {
      keywords: ["pregnant", "pregnancy", "expecting", "nursing"],
      response:
        "Pregnancy increases sensitivity to nitrates, PFAS, lead, and arsenic because they cross the placenta and concentrate in breast milk. We recommend pairing whole-home catalytic carbon with RO at the kitchen tap so prenatal vitamins aren't competing with contaminants. I can document every reading for your OB or pediatrician.",
    },
    {
      keywords: ["newborn", "infant", "formula", "bottle"],
      response:
        "Infants drink triple the water per pound compared with adults. Nitrate, manganese, and lead can impair oxygen transport, neurological development, and sleep. We'll highlight those ratios and make sure your RO tap feeds formula, bottles, humidifiers, and ice makers.",
    },
    {
      keywords: ["elderly", "senior", "aging"],
      response:
        "Older adults face higher risk from disinfection byproducts (cardiovascular strain) and heavy metals (kidney function). Mission Pure documents contaminant reductions so physicians can track improvements alongside bloodwork and blood pressure readings.",
    },
    {
      keywords: ["autoimmune flare", "lupus", "ms"],
      response:
        "Clients managing autoimmune conditions often notice fewer flares once chloramine, PFAS, and VOCs drop. We'll show the before/after lab data plus upkeep schedules so inflammation triggers stay low.",
    },
    {
      keywords: ["digestion", "stomach", "gut", "ibs"],
      response:
        "Chlorine/chloramine upset gut flora, and copper or lead can irritate the GI tract. RO removes the metals while catalytic carbon knocks down disinfectants so sensitive stomachs calm down.",
    },
  ];
  vulnerableGroupNotes.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  registerNovaDialogue(
    ["where are you located", "office", "hq", "headquarters"],
    "Mission Pure is headquartered in Dallas-Fort Worth. We operate mobile install teams across the metro so we can be on-site quickly."
  );

  registerNovaDialogue(
    ["do you go outside dfw", "austin", "houston", "san antonio"],
    "Right now Mission Pure stays focused on Dallas-Fort Worth so we can respond fast. If you have a nearby project, let me know and I'll flag it for expansion."
  );

  const contaminantEntries = [
    { name: "PFAS", keywords: ["pfas", "pfoa", "pfos"], response: "PFAS indicators show up across DFW. Mission Pure maps your ZIP, estimates the ratio vs health guidelines, and pairs that with whole-home + RO coverage." },
    { name: "lead", keywords: ["lead"], response: "Lead typically spikes from plumbing, but we watch sample data too. Whole-home filtration plus point-of-use RO keeps levels as low as possible." },
    { name: "chromium", keywords: ["chromium", "chromium 6", "hexavalent"], response: "Hexavalent chromium is a known DFW concern. Our media blends are selected specifically to reduce it below health guideline references." },
    { name: "chloramine", keywords: ["chloramine", "chloramines"], response: "Dallas and Fort Worth utilities rely on chloramine. Whole-home catalytic carbon is the best defense so showers and laundry stay comfortable." },
    { name: "chlorine", keywords: ["chlorine"], response: "Chlorine is common in municipal systems. Whole-home carbon removes odor/taste while RO polishes drinking water." },
    { name: "tthm", keywords: ["tthm", "trihalomethane", "haloacetic"], response: "TTHMs/HAA5 spike when chlorine meets organics. Mission Pure tracks those multipliers and installs carbon stacks sized for each home." },
    { name: "nitrate", keywords: ["nitrate", "nitrite"], response: "Nitrate issues show up near ag runoff. Reverse osmosis is the go-to solution, and we have NSF-certified systems for kitchen taps." },
    { name: "arsenic", keywords: ["arsenic"], response: "Arsenic can appear in private wells or blended supplies. We can spec media tanks plus RO membranes that target it head-on." },
    { name: "bromate", keywords: ["bromate"], response: "Bromate can form during ozonation. We'll show you the reported level and match a filter train for consistent protection." },
    { name: "fluoride", keywords: ["fluoride"], response: "Fluoride is dosed intentionally. Families that want to lower it can add RO for drinking + cooking and still keep remineralized taste options." },
    { name: "sodium", keywords: ["sodium"], response: "If you're watching sodium intake, under-sink RO or a remineralization cartridge keeps drinking water within your goals." },
    { name: "manganese", keywords: ["manganese"], response: "Manganese staining is a sign of buildup. Mission Pure can pair whole-home carbon + polishing filters to drop it dramatically." },
    { name: "iron", keywords: ["iron"], response: "Orange or metallic taste? We'll stage iron reduction media plus RO for kitchen taps so water looks and tastes neutral." },
    { name: "bacteria", keywords: ["coliform", "bacteria"], response: "If total coliform pops up, we combine UV or advanced carbon with RO so the entire home stays safeguarded." },
    { name: "turbidity", keywords: ["turbidity", "cloudy"], response: "Cloudy water often points to turbidity changes. Our systems include sediment pre-filtration staged ahead of carbon and RO polishing." },
    { name: "taste", keywords: ["taste", "odor", "smell"], response: "A strong chlorine or earthy smell? Whole-home catalytic carbon removes the fumes so showers and kitchens smell clean." },
    { name: "hard water", keywords: ["hard", "scale", "spots"], response: "Hard water scale is rampant across DFW. Mission Pure installs conditioning media with smart valves to protect fixtures and appliances." },
    { name: "cloudy ice", keywords: ["ice", "coffee", "tea"], response: "Cloudy ice or bitter coffee usually tracks back to dissolved solids. Under-sink RO with remineralization keeps drinks crisp." },
    { name: "baby", keywords: ["baby", "infant", "nursery"], response: "For nurseries we layer RO plus whole-home protection so bottles, baths, and humidifiers stay ultra-clean." },
    { name: "pet", keywords: ["pet", "dog", "cat"], response: "Pets drink a ton of water too. Families often use our RO spigots to fill bowls so furry friends get the same clean standard." }
  ];
  contaminantEntries.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const productFocus = [
    { keywords: ["whole home", "whole-house", "poe"], response: "Whole-home (point-of-entry) systems treat every faucet for bathing, laundry, and cooking. We pair them with RO for drinking." },
    { keywords: ["reverse osmosis", "ro", "under sink"], response: "Under-sink RO adds a dedicated faucet (and fridge feed) for ultra-low TDS water. Great for cooking, bottles, coffee, and ice." },
    { keywords: ["shower filter", "bath"], response: "Mission Pure focuses on whole-home systems for showers because they protect every bathroom at once." },
    { keywords: ["countertop", "apartment", "rent"], response: "Renting? We can start with compact RO units that avoid permanent plumbing changes, then upgrade later." },
    { keywords: ["commercial", "restaurant", "cafe"], response: "We support light commercial installs—cafés, salons, pediatric offices—across DFW with tailored maintenance plans." },
    { keywords: ["well", "private well"], response: "For private wells we add sediment + UV when needed, then layer Puronics conditioning to stabilize taste and odor." },
    { keywords: ["maint", "maintenance", "filters"], response: "We provide maintenance schedules, filter reminders, and optional service plans so Nova can nudge you when media change-outs are due." },
    { keywords: ["smart", "monitor", "app"], response: "Mission Pure systems include smart valves that track usage. We can enable alerts if water use spikes or media needs attention." },
    { keywords: ["resale", "home value"], response: "Filtration upgrades are a selling point. Buyers appreciate low-scale fixtures and documented contaminant reductions." },
    { keywords: ["compar", "compare", "which system"], response: "Tell me about your routines—showers, cooking, kids—and I'll recommend a combo of whole-home + RO to match." },
    { keywords: ["demo", "test", "sample"], response: "We can review city lab data instantly and schedule on-site testing when we visit for the consult." },
    { keywords: ["permits", "code", "license"], response: "Mission Pure pulls any required permits, and all installers are insured + licensed for plumbing tie-ins." }
  ];
  productFocus.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const lifestyleScenarios = [
    { keywords: ["coffee", "espresso"], response: "Baristas love our RO setups because they stabilize TDS for espresso, pour-overs, and ice." },
    { keywords: ["tea", "kettle"], response: "Filtered water keeps kettles scale-free so tea tastes bright and equipment lasts longer." },
    { keywords: ["skin", "eczema", "dermatitis"], response: "Reducing chlorine and chloramine in showers helps sensitive skin calm down. Whole-home carbon is the go-to fix." },
    { keywords: ["hair", "color", "salon"], response: "Stylists notice hair color lasts longer when chlorine is removed. We can show you before/after results." },
    { keywords: ["laundry", "washer"], response: "Filtered water protects washers and keeps clothes softer by eliminating scale and chemical odors." },
    { keywords: ["dishwasher", "spotted", "glasses"], response: "Hard water spots disappear when we condition the whole home, so dishes dry crystal clear." },
    { keywords: ["humidifier", "steam", "diffuser"], response: "Use filtered water in humidifiers to avoid white dust and extend device life." },
    { keywords: ["pool", "spa", "hot tub"], response: "We can coordinate filtration that keeps fill water consistent so balancing pools/spas is easier." },
    { keywords: ["garden", "plants", "hydroponic"], response: "Gardeners often use RO water for seedlings and hydroponics. We can plumb a dedicated spigot outdoors." },
    { keywords: ["elderly", "seniors"], response: "We tailor installs for seniors with easy-to-read bypass valves and prioritized service windows." },
    { keywords: ["medical", "immune", "health condition"], response: "For medical concerns we share lab-backed data and can provide post-install verification samples." },
    { keywords: ["storm", "boil", "notice"], response: "If a boil notice hits, Mission Pure systems give you an immediate safety net with multi-stage filtration." },
    { keywords: ["move", "new home", "builder"], response: "Moving soon? We can inspect the builder's plumbing stub-outs and plan your filtration before closing." },
    { keywords: ["real estate", "agent", "listing"], response: "Agents lean on Mission Pure to prep listings with whole-home filtration as a premium upgrade." }
  ];
  lifestyleScenarios.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const processTopics = [
    { keywords: ["process", "how does this work", "steps"], response: "1) Run your ZIP + pick a utility. 2) We review contaminants and recommend a system. 3) Licensed installers set it up, register warranties, and walk you through every valve." },
    { keywords: ["install day", "installation", "what happens install"], response: "On install day we shut off water briefly, tie into the main line, plumb the bypass, and flush the system. You'll have running water again within an hour." },
    { keywords: ["where does it go", "placement", "garage"], response: "Most systems live in the garage near the main line. We can also use utility rooms or exterior enclosures if that suits your layout." },
    { keywords: ["how long install", "install time"], response: "Standard installs take 2-4 hours. Adding under-sink RO or running long drain lines can add a little time, but it's all done same day." },
    { keywords: ["maintenance", "how often", "filter change"], response: "Whole-home tanks typically need media refreshes every 6-8 years depending on usage. RO prefilters are swapped annually. We'll give you a calendar and reminders." },
    { keywords: ["diy", "self install"], response: "Mission Pure handles install because we warranty the plumbing, register the system, and verify performance. That way your investment stays protected." },
    { keywords: ["salt", "delivery"], response: "Need salt delivery? We can recommend a subscription partner or show you how to top off the brine tank yourself." },
    { keywords: ["smart alerts", "notifications"], response: "We can enable smart valve alerts so you know when water use spikes, filters need attention, or vacation mode should kick in." },
    { keywords: ["post install", "after install"], response: "After install you'll receive a digital packet with serial numbers, warranty details, and simple care instructions." },
    { keywords: ["test after", "lab after install"], response: "If you'd like a post-install sample, we can schedule a lab pickup or provide test kits to confirm performance." },
  ];
  processTopics.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const troubleshooting = [
    { keywords: ["zip not working", "lookup broken", "zip failed"], response: "If the ZIP tool can't find your utility, screenshot the message or tell me the city and I'll add it manually." },
    { keywords: ["data source", "where data", "ewg"], response: "Mission Pure blends Texas utility reports, TWDB maps, and our curated contaminant dataset so you're not relying on a single source." },
    { keywords: ["privacy", "data privacy", "secure"], response: "We only ask for your ZIP and optional contact info—no marketing lists or third-party sharing. Chats stay private." },
    { keywords: ["error", "bug", "issue"], response: "Thanks for flagging that! Describe what you saw and I'll log it for the dev team right away." },
    { keywords: ["no results", "blank", "empty"], response: "Some utilities block data. In that case we use our Texas fallback set and invite you to upload your paper report." },
    { keywords: ["financing link", "apply"], response: "Financing links go out during your consult to keep info secure. I can schedule that call if you'd like." },
    { keywords: ["reschedule", "change appointment"], response: "Need to move your appointment? Let me know the new window and I'll ping the scheduler." },
    { keywords: ["cancel", "stop", "hold"], response: "No worries—plans change. I'll note the pause and you can pick back up anytime." },
  ];
  troubleshooting.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const followUps = [
    { keywords: ["send report", "email report"], response: "Drop your email and I'll send a recap with contaminant highlights, product options, and scheduling links." },
    { keywords: ["text me", "sms"], response: "We can text you ZIP lookup links or reminders if you prefer SMS. Just let me know the number and desired updates." },
    { keywords: ["photos", "upload", "share pic"], response: "Need to share plumbing photos? Use the contact page or reply to our scheduling email—I'll attach them to your file." },
    { keywords: ["follow up", "check back"], response: "I'll note a follow-up. Expect a friendly reminder within 24 hours unless you need something sooner." },
    { keywords: ["quote email", "proposal"], response: "Once we document your system, you'll get a digital proposal with itemized pricing and financing options to approve online." },
  ];
  followUps.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const filtrationTech = [
    {
      keywords: ["ro vs whole home", "ro vs tank", "difference between ro and tank", "reverse osmosis vs tank"],
      response:
        "Reverse osmosis (RO) is point-of-use—it strips dissolved solids for drinking/cooking taps. Whole-home tanks treat every faucet with catalytic carbon + conditioning to remove chlorine, chloramine, scale, and odors. Most families pair both: tank for showers/laundry, RO for drinking.",
    },
    {
      keywords: ["ro vs carbon", "reverse osmosis vs carbon"],
      response:
        "Carbon filters adsorb chlorine, chloramine, VOCs, and taste/odor compounds. RO goes further, forcing water through a semi-permeable membrane to remove dissolved solids (nitrates, PFAS, metals). Carbon = whole-home comfort; RO = ultra-clean kitchen water.",
    },
    {
      keywords: ["ro maintenance", "change ro filters", "ro membrane"],
      response:
        "RO prefilters (sediment + carbon) swap every 6-12 months; the membrane lasts 3-5 years depending on TDS. Mission Pure logs your install so Nova can remind you when cartridges are due.",
    },
    {
      keywords: ["tank media", "what's in the tank", "catalytic carbon", "resin"],
      response:
        "Mission Pure tanks use layered catalytic carbon for chlorine/chloramine reduction plus specialty resin or scale-control media. Media is NSF-certified and sized to your household's flow so you keep pressure while neutralizing contaminants.",
    },
    {
      keywords: ["uv filter", "uv light", "bacteria treatment"],
      response:
        "UV reactors sterilize bacteria/viruses as water passes the lamp. We pair UV with RO or whole-home systems for wells or boil-notice-prone neighborhoods. Lamps swap annually, sleeves get cleaned during service visits.",
    },
    {
      keywords: ["commercial system", "restaurant filtration", "office filtration"],
      response:
        "Mission Pure outfits cafés, salons, medical suites, and small manufacturing with high-flow carbon, RO skids, and remineralized lines for espresso/ice. We manage maintenance schedules so health inspections stay happy.",
    },
    {
      keywords: ["softener vs conditioner", "salt free vs salt", "scale system"],
      response:
        "Salt-based softeners exchange hardness minerals for sodium/potassium. Salt-free conditioners (template-assisted crystallization) keep minerals suspended so they can't form scale. We'll recommend one based on plumbing goals and local ordinances.",
    },
    {
      keywords: ["iron filter", "manganese filter"],
      response:
        "Iron/manganese need catalytic media plus oxidation (air draw or peroxide). We stage that ahead of the main tank so fixtures stop staining and RO cartridges last longer.",
    },
    {
      keywords: ["microplastics", "emerging contaminants"],
      response:
        "RO and sub-micron carbon block filters remove most microplastics. Mission Pure keeps an eye on EPA's draft regulations so your setup stays ahead of emerging contaminant rules.",
    },
    {
      keywords: ["radium", "uranium", "radioactive", "radon"],
      response:
        "For radionuclides we deploy specialty anion exchange or bone-char media plus RO polishing. We'll review your water report to size the media bed correctly and plan disposal per Texas regs.",
    },
    {
      keywords: ["lead removal", "lead filter", "nsf 53"],
      response:
        "Point-of-use RO and NSF/ANSI 53-certified carbon block cartridges target lead. Whole-home tanks add redundancy by preventing particulate lead from entering showers/laundry.",
    },
    {
      keywords: ["chloramine removal", "chlorine removal"],
      response:
        "Dallas/Fort Worth utilities dose chloramine. Mission Pure uses catalytic carbon with extended contact time to break chloramine into ammonia/chloride, then polishes with RO for drinking water.",
    },
    {
      keywords: ["media lifespan", "how long do filters last"],
      response:
        "Whole-home media typically lasts 6-8 years, depending on gallons and contaminant load. Nova can log your install date so we automatically plan the refresh before performance drifts.",
    },
    {
      keywords: ["flow rate", "pressure drop", "gpm"],
      response:
        "We size tanks for your peak GPM. Larger media beds + 1\" bypass manifolds keep pressure steady even when showers, laundry, and irrigation run at once.",
    },
    {
      keywords: ["backwash", "regeneration", "brine"],
      response:
        "Conditioners periodically backwash to fluff carbon and purge captured contaminants. Smart valves track gallons and trigger regeneration at off-peak hours so you never notice.",
    },
  ];
  filtrationTech.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const contaminantsDeepDive = [
    {
      keywords: ["perchlorate", "rocket fuel"],
      response:
        "Perchlorate can slip into groundwater from industrial sites. RO plus ion exchange resins knock it down below health advisory levels—ask me to flag it if it shows in your report.",
    },
    {
      keywords: ["microbial", "coliform", "e. coli"],
      response:
        "Total coliform or E. coli means you need disinfection. We combine UV or chlorination contact tanks with carbon/RO to ensure taste and safety.",
    },
    {
      keywords: ["sulfur", "rotten egg smell"],
      response:
        "Sulfur odors point to hydrogen sulfide. Air-injection oxidizing filters or peroxide feed systems convert it to elemental sulfur, which we then filter out.",
    },
    {
      keywords: ["scale", "hard water", "calcium"],
      response:
        "Hardness minerals leave scale on fixtures and appliances. Conditioning tanks or softeners capture them, and RO keeps espresso machines + kettles spotless.",
    },
    {
      keywords: ["turbidity", "sediment", "cloudy"],
      response:
        "Sediment cartridges (5 micron down to 1 micron) sit in front of RO and tanks to keep turbidity low. We upsize housings so flow isn't choked.",
    },
    {
      keywords: ["arsenic", "arsenic filter"],
      response:
        "Arsenic needs adsorption media (Bayoxide, titanium) plus RO. We'll test speciation (As III vs As V) to pick pretreatment like oxidation so removal stays >95%.",
    },
    {
      keywords: ["nitrate", "nitrite", "fertilizer"],
      response:
        "Nitrate/nitrite require RO or anion exchange. We routinely see spikes near agricultural runoff—RO at the kitchen sink eliminates it for infants and expecting parents.",
    },
    {
      keywords: ["fluoride removal", "fluoride filter"],
      response:
        "Municipal fluoride stays unless you use RO or activated alumina. Mission Pure configures RO with remineralization if you want taste/balance restored.",
    },
    {
      keywords: ["bromate", "ozone"],
      response:
        "Bromate forms when ozone hits bromide in source water. Catalytic carbon and RO reduce it; we'll show you the ratio vs health guideline in your report.",
    },
    {
      keywords: ["pfas", "forever chemicals"],
      response:
        "PFAS needs high-capacity carbon + RO. We watch EPA's new 4 ppt limit and size systems to keep you below it even if source water fluctuates.",
    },
  ];
  contaminantsDeepDive.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  const zipExamples = [
    "75001",
    "75002",
    "75034",
    "75035",
    "75036",
    "75052",
    "75054",
    "75056",
    "75069",
    "75070",
    "75071",
    "75074",
    "75075",
    "75078",
    "75082",
    "75093",
    "76092",
    "76102",
    "76107",
    "76108",
    "76126",
    "76131",
    "76226",
    "76227",
    "76244",
    "76248",
  ];
  zipExamples.forEach((zip) => {
    registerNovaDialogue([
      zip,
      `zip ${zip}`,
      `check ${zip}`,
      `${zip} water`
    ], `I can pull utility data for ${zip}. Tap "Check your water" in the header or let me open the ZIP lookup modal for you.`, { action: "openZip" });
  });

  const advancedQuestions = [
    { keywords: ["installer", "technician"], response: "Our installers are background-checked, insured, and city-registered. You'll meet them before work begins." },
    { keywords: ["permits"], response: "If a permit is required, Mission Pure files it and coordinates inspection so you don't have to." },
    { keywords: ["cleanup", "mess"], response: "We protect floors, run clean copper/Pex tie-ins, and haul away any packaging. Your home stays tidy." },
    { keywords: ["monitor", "app", "remote"], response: "We can add remote monitoring so you'll get filter-life alerts on your phone." },
    { keywords: ["salt", "sodium system"], response: "Need salt-free? We have catalytic media options plus traditional conditioning tanks if you prefer salt." },
    { keywords: ["compare", "other quotes"], response: "Bring me any quote, and I'll highlight differences in media quality, service plan, and warranty." },
    { keywords: ["gbp", "google business"], response: "Our Google Business Profile lists weekly posts, photos, and real installs. Search \"Mission Pure Dallas\" anytime." },
    { keywords: ["cbc", "lab"], response: "Need a lab-ready sample? We'll coordinate accredited testing for documentation." },
    { keywords: ["emergency", "rush"], response: "We keep emergency slots for boil notices or newborn arrivals. Let me know your timing and I'll flag the team." },
    { keywords: ["tankless", "water heater"], response: "Filtered water extends tankless heater life and keeps warranties valid. Installers can tie into the heater loop." },
    { keywords: ["pressure", "psi"], response: "Concerned about pressure? We size bypass manifolds so your PSI stays stable after install." },
    { keywords: ["rental", "landlord"], response: "We work with landlords, HOAs, and property managers. Documentation is included for each install." },
    { keywords: ["filters included", "media"], response: "We preload the tanks with the exact carbon/resin mix recommended by Puronics for your contaminants." },
    { keywords: ["service plan"], response: "Opt into Mission Pure Care for annual inspections, media swaps, and Nova reminders." },
    { keywords: ["docs", "spec sheet"], response: "Need spec sheets or NSF certs? I can email them after the chat or during your consult." },
    { keywords: ["checklist", "prep"], response: "Before install: clear access to the main line, and note any low-hanging shelves. We handle the rest." },
    { keywords: ["remove", "old system"], response: "Upgrading from an older filter? We'll remove and haul it away as part of the job." },
    { keywords: ["outdoor", "hose", "spigot"], response: "We can bypass garden spigots if you prefer untreated water for plants, or leave them filtered—your choice." },
    { keywords: ["garage", "attic"], response: "Most installs go in the garage. If you need attic or crawlspace placement, we'll plan for insulation and drainage." },
    { keywords: ["freeze", "winter", "insulate"], response: "We insulate lines and can add heat tape recommendations so your system is ready for North Texas freezes." }
  ];
  advancedQuestions.forEach((entry) => registerNovaDialogue(entry.keywords, entry.response));

  registerNovaDialogue([], "Sure thing—opening the ZIP lookup so you can see your contaminant list.", {
    matcher: (input) => input.includes("check my zip") || input.includes("zip lookup"),
    action: "openZip",
  });

  registerNovaDialogue([], "I'll route you to the contact page so you can send photos or documents.", {
    matcher: (input) => input.includes("email") || input.includes("contact form"),
    action: "goContact",
  });

  registerNovaDialogue([], `Want to speak live? Tap the call button or dial ${NOVA_CALL_TEXT}.`, {
    matcher: (input) => input.includes("talk to human") || input.includes("agent"),
  });

  console.log("Nova dialogue intents:", NOVA_DIALOGUES.length);
})();

const MULTIPLIER_HINTS = {
  arsenic: 250,
  lead: 80,
  "total trihalomethanes (tthms)": 70,
  "total haloacetic acids (haa5)": 45,
  chloroform: 26,
  bromodichloromethane: 51,
  dibromochloromethane: 32,
  bromoform: 16,
  nitrate: 32,
  "nitrate (as n)": 32,
  nitrite: 6,
  "nitrite (as n)": 6,
  fluoride: 3,
  atrazine: 9,
  simazine: 7,
  glyphosate: 15,
  benzene: 5,
  "trichloroethylene (tce)": 9,
  "tetrachloroethylene (pce)": 9,
  "pfas (indicator)": 350,
  pfoa: 350,
  pfos: 350,
  chlorine: 2,
  chloramine: 2,
  chloramines: 2,
};

const LEVEL_MULTIPLIER_HINTS = {
  high: 140,
  medium: 42,
  low: 8,
};

let cachedDataset = null;
let cachedChemInfo = null;

async function loadChemicalInfo() {
  if (cachedChemInfo) return cachedChemInfo;
  try {
    const res = await fetch(CHEM_INFO_URL, { cache: "no-store" });
    if (!res.ok) {
      cachedChemInfo = {};
      return cachedChemInfo;
    }
    const json = await res.json();
    cachedChemInfo = json && typeof json === "object" ? json : {};
    return cachedChemInfo;
  } catch {
    cachedChemInfo = {};
    return cachedChemInfo;
  }
}

function pwsFromUtilityId(utilityId) {
  const id = String(utilityId || "");
  if (id.startsWith("tx-pws-")) {
    const raw = id.slice("tx-pws-".length).replace(/[^0-9]/g, "");
    if (raw.length >= 5 && raw.length <= 7) {
      const code = raw.padStart(7, "0");
      return `TX${code}`;
    }
  }
  return "";
}

async function lookupEwgChemicalsByUtilityId(utilityId) {
  const pws = pwsFromUtilityId(utilityId);
  if (!pws) return [];
  try {
    const url = `${EWG_PROXY_URL}?pws=${encodeURIComponent(pws)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const chems = Array.isArray(json?.chemicals) ? json.chemicals : [];
    // Ensure shape matches our renderer expectations
    return chems
      .map((c) => ({
        name: c?.name ? String(c.name) : "",
        category: c?.category ? String(c.category) : "",
        concerns: c?.concerns ? String(c.concerns) : "",
        thisUtilityValue: c?.thisUtilityValue,
        guidelineValue: c?.guidelineValue,
        unit: c?.unit ? String(c.unit) : "",
        level: c?.level ? String(c.level) : "",
      }))
      .filter((c) => c.name);
  } catch {
    return [];
  }
}

async function loadDataset() {
  if (cachedDataset) return cachedDataset;

  const [baseRes, dfwRes] = await Promise.all([
    fetch(DATASET_URL, { cache: "no-store" }),
    fetch(DFW_ZIP_MAP_URL, { cache: "no-store" }).catch(() => null),
  ]);

  if (!baseRes.ok) throw new Error("dataset_load_failed");
  const baseJson = await baseRes.json();

  let dfwJson = null;
  if (dfwRes && dfwRes.ok) {
    try {
      dfwJson = await dfwRes.json();
    } catch {
      dfwJson = null;
    }
  }

  // Merge: base dataset remains authoritative for chemicals; DFW ZIP map augments zipToUtilities.
  const mergedZipToUtilities = {
    ...(baseJson?.zipToUtilities || {}),
    ...(dfwJson?.zipToUtilities || {}),
  };

  cachedDataset = {
    ...baseJson,
    zipToUtilities: mergedZipToUtilities,
  };
  return cachedDataset;
}

/**
 * Dataset provider: utilities + chemicals come from /data/water-data.json.
 * This avoids showing fake results. If a ZIP/utility isn't covered yet,
 * the UI will show a clear coverage message.
 */
const DatasetProvider = {
  async getUtilitiesByZip(zip) {
    const dataset = await loadDataset();
    const list = dataset?.zipToUtilities?.[zip];
    if (Array.isArray(list) && list.length > 0) return list;

    // Fallback (Texas): use public TWDB service boundary data to find utility for a ZIP.
    // This gives real utility names for many TX ZIPs without preloading a full table.
    const txUtilities = await lookupTexasUtilitiesByZip(zip);
    return txUtilities;
  },

  async getChemicalsByUtilityId(utilityId) {
    const dataset = await loadDataset();
    const list = dataset?.utilityChemicals?.[utilityId];
    if (Array.isArray(list) && list.length > 0) return list;

    const isTexasUtility =
      String(utilityId || "").startsWith("tx-pws-") || String(utilityId || "").startsWith("tx-override-");
    if (isTexasUtility) {
      const ewg = await lookupEwgChemicalsByUtilityId(utilityId);
      if (Array.isArray(ewg) && ewg.length > 0) return ewg;
      const fallback = dataset?.utilityChemicals?.__tx_default;
      return Array.isArray(fallback) ? fallback : [];
    }

    return [];
  },
};

let lastUtilitiesLookupDebug = "";

async function lookupTexasUtilitiesByZip(zip) {
  try {
    lastUtilitiesLookupDebug = "";

    // Prefer same-origin proxy in production (avoids CORS blocks on public APIs).
    // In local preview (127.0.0.1/localhost), PHP won't be running, so skip the proxy.
    if (shouldUseUtilitiesProxy()) {
      const proxied = await tryProxyUtilitiesLookup(zip);
      if (proxied) return proxied;
    }

    const geoRes = await fetch(`${ZIP_GEO_URL}${encodeURIComponent(zip)}`, { cache: "no-store" });
    if (!geoRes.ok) return [];
    const geo = await geoRes.json();
    const place = Array.isArray(geo?.places) ? geo.places[0] : null;
    const lat = place ? Number.parseFloat(place.latitude) : NaN;
    const lon = place ? Number.parseFloat(place.longitude) : NaN;
    const state = place?.["state abbreviation"];

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    if (state !== "TX") return [];

    const params = new URLSearchParams({
      f: "json",
      where: "1=1",
      geometry: `${lon},${lat}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "pwsName,PWSCode",
      returnGeometry: "false",
      resultRecordCount: "10",
    });

    const twdbRes = await fetch(`${TWDB_PWS_QUERY_URL}?${params.toString()}`, { cache: "no-store" });
    if (!twdbRes.ok) return [];
    const twdb = await twdbRes.json();
    const features = Array.isArray(twdb?.features) ? twdb.features : [];

    const utilities = features
      .map((f) => f?.attributes)
      .filter(Boolean)
      .map((a) => {
        const code = a.PWSCode;
        const name = a.pwsName;
        if (!code || !name) return null;
        return {
          id: `tx-pws-${String(code)}`,
          name: String(name),
          region: "TX",
        };
      })
      .filter(Boolean);

    // De-dupe by id
    const seen = new Set();
    return utilities.filter((u) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  } catch {
    return [];
  }
}

function shouldUseUtilitiesProxy() {
  try {
    const host = String(window.location?.hostname || "").toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    return true;
  } catch {
    return false;
  }
}

async function tryProxyUtilitiesLookup(zip) {
  try {
    const url = `${UTILITIES_PROXY_URL}?zip=${encodeURIComponent(zip)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      lastUtilitiesLookupDebug = `proxy_http_${res.status}`;
      return null;
    }
    const json = await res.json();
    const utilities = json?.utilities;
    if (!Array.isArray(utilities)) {
      lastUtilitiesLookupDebug = "proxy_bad_json";
      return null;
    }
    lastUtilitiesLookupDebug = `proxy_ok_${utilities.length}`;
    return utilities;
  } catch {
    lastUtilitiesLookupDebug = "proxy_fetch_failed";
    return null;
  }
}

const els = {
  zipModal: document.getElementById("zipModal"),
  openZipModalBtn: document.getElementById("openZipModalBtn"),
  closeZipModalBtn: document.getElementById("closeZipModalBtn"),
  changeLocationBtn: document.getElementById("changeLocationBtn"),
  startBtn: document.getElementById("startBtn"),

  bannerCheckBtn: document.getElementById("bannerCheckBtn"),
  miniCtaBtn: document.getElementById("miniCtaBtn"),

  newsletterForm: document.getElementById("newsletterForm"),
  emailInput: document.getElementById("emailInput"),

  zipInline: document.getElementById("zipInline"),
  zipInlineBtn: document.getElementById("zipInlineBtn"),

  zipInput: document.getElementById("zipInput"),
  zipHelp: document.getElementById("zipHelp"),

  utilityRow: document.getElementById("utilityRow"),
  utilitySelect: document.getElementById("utilitySelect"),
  utilityHelp: document.getElementById("utilityHelp"),

  modalPrimaryBtn: document.getElementById("modalPrimaryBtn"),
  resetModalBtn: document.getElementById("resetModalBtn"),
  modalError: document.getElementById("modalError"),

  resultsEmpty: document.getElementById("resultsEmpty"),
  results: document.getElementById("results"),
  resultsMeta: document.getElementById("resultsMeta"),
  chemicalsSubtitle: document.getElementById("chemicalsSubtitle"),
  chemCards: document.getElementById("chemCards"),
  chemTableBody: document.getElementById("chemTableBody"),
  notice: document.getElementById("notice"),

  chemicalModal: document.getElementById("chemicalModal"),
  closeChemicalModalBtn: document.getElementById("closeChemicalModalBtn"),
  chemicalModalTitle: document.getElementById("chemicalModalTitle"),
  chemicalModalSubtitle: document.getElementById("chemicalModalSubtitle"),
  chemicalModalBody: document.getElementById("chemicalModalBody"),
  novaToggle: null,
  novaPanel: null,
  novaMessages: null,
  novaSuggestions: null,
  novaForm: null,
  novaInput: null,
  novaClose: null,
  navToggle: document.getElementById("navToggle"),
  contactForm: document.getElementById("contactForm"),
  contactAutoResponse: document.getElementById("contactAutoResponse"),
  contactSummaryList: document.getElementById("contactSummaryList"),
  contactAutoResponseText: document.getElementById("contactAutoResponseText"),
  contactAutoResponseTitle: document.getElementById("contactAutoResponseTitle"),
  contactMailtoLink: document.getElementById("contactMailtoLink"),
  contactFollowupNote: document.getElementById("contactFollowupNote"),
  contactCopySummary: document.getElementById("contactCopySummary"),
  contactZipField: document.getElementById("contactZip"),
  contactPhoneField: document.getElementById("contactPhone"),
  contactTimelineField: document.getElementById("contactTimeline"),
  contactProjectField: document.getElementById("contactProject"),
  contactDetailsField: document.getElementById("contactDetails"),
  contactEmailField: document.getElementById("contactEmail"),
  contactNameField: document.getElementById("contactName"),
};

let lastFocusedEl = null;
let lastZipSearched = "";
let zipLookupTimer = null;
let utilitiesRequestVersion = 0;
let novaMissCount = 0;
let novaInitialized = false;
let novaHasGreeted = false;
let novaProactiveTimer = null;
let novaSuggestionsDismissed = false;
let navHost = null;
let navActions = null;
let navToggle = null;

init();

function init() {
  try {
    // Helps verify cache-busting is working in real browsers.
    console.log("Mission Pure app build:", APP_BUILD);
  } catch {
    // no-op
  }
  initMobileNav();
  try {
    initNova();
  } catch (error) {
    console.error("Nova failed to initialize", error);
  }
  wireEvents();
  hydrateFromStorage();
  hydrateContactForm();

  // Imperative requirement: show popup once someone visits.
  // If user already has saved results, we won't auto-block them with the modal.
  const hasSaved = Boolean(loadState());
  if (!hasSaved) {
    openModal();
  }
}

function wireEvents() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isModalOpen()) {
      closeModal();
    }

    if (e.key === "Escape" && isChemicalModalOpen()) {
      closeChemicalModal();
    }

    if (e.key === "Escape" && !els.novaPanel?.hidden) {
      closeNova();
    }

    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNavMenu();
    }
  });

  els.openZipModalBtn?.addEventListener("click", openModal);
  els.changeLocationBtn?.addEventListener("click", openModal);
  els.startBtn?.addEventListener("click", openModal);
  els.bannerCheckBtn?.addEventListener("click", openModal);
  els.miniCtaBtn?.addEventListener("click", openModal);

  els.closeZipModalBtn?.addEventListener("click", closeModal);
  els.zipModal?.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target instanceof HTMLElement && target.dataset.close === "true") {
      closeModal();
    }
  });

  els.closeChemicalModalBtn?.addEventListener("click", closeChemicalModal);
  els.chemicalModal?.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target instanceof HTMLElement && target.dataset.close === "true") {
      closeChemicalModal();
    }
  });

  els.zipInlineBtn?.addEventListener("click", () => {
    const zip = sanitizeZip(els.zipInline.value);
    if (!zip) {
      openModal();
      els.zipInput.focus();
      return;
    }
    openModal({ zip });
  });

  els.zipInline?.addEventListener("input", () => {
    els.zipInline.value = sanitizeZip(els.zipInline.value);
  });

  els.zipInput?.addEventListener("input", () => {
    els.zipInput.value = sanitizeZip(els.zipInput.value);
    clearModalError();

    const zip = els.zipInput.value;
    if (zip !== lastZipSearched) {
      // ZIP changed: clear any previously populated utilities to avoid stale selections.
      els.utilityRow.hidden = true;
      els.utilityHelp.textContent = "";
      els.utilitySelect.innerHTML = '<option value="" selected disabled>Select your utility</option>';
      els.utilitySelect.value = "";
      updatePrimaryButton();
    }

    if (zipLookupTimer) window.clearTimeout(zipLookupTimer);
    if (isValidZip(zip)) {
      zipLookupTimer = window.setTimeout(() => {
        // Auto-populate utilities immediately once we have a full ZIP.
        findUtilities(zip);
      }, 250);
    }
  });

  els.utilitySelect?.addEventListener("change", () => {
    clearModalError();
    updatePrimaryButton();
  });

  els.modalPrimaryBtn?.addEventListener("click", async () => {
    clearModalError();
    hideNotice();

    const zip = sanitizeZip(els.zipInput.value);

    if (!isValidZip(zip)) {
      showModalError("Please enter a valid 5-digit ZIP code.");
      els.zipInput.focus();
      return;
    }

    if (els.utilityRow.hidden) {
      await findUtilities(zip);
      return;
    }

    const utilityId = els.utilitySelect.value;
    if (!utilityId) {
      showModalError("Please select your water utility.");
      els.utilitySelect.focus();
      return;
    }

    const utilityName = els.utilitySelect.options[els.utilitySelect.selectedIndex]?.textContent ?? "";
    const utilityRegion = els.utilitySelect.selectedOptions[0]?.dataset.region ?? "";

    const didRender = await renderResults({ zip, utilityId, utilityName, utilityRegion });
    if (didRender) {
      closeModal();
      try {
        document.getElementById("resultsHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        // no-op
      }
    }
  });

  els.resetModalBtn?.addEventListener("click", () => {
    resetModal();
    els.zipInput.focus();
  });

  els.newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    hideNotice();

    const email = String(els.emailInput?.value || "").trim();
    if (!isValidEmail(email)) {
      showNotice("Please enter a valid email address.");
      els.emailInput?.focus();
      return;
    }

    showNotice("Thanks! You're subscribed for Mission Pure updates.");
    if (els.emailInput) els.emailInput.value = "";
  });

  els.novaToggle?.addEventListener("click", toggleNova);
  els.novaClose?.addEventListener("click", closeNova);
  els.novaForm?.addEventListener("submit", handleNovaSubmit);

  scheduleNovaProactiveGreeting();

  els.contactForm?.addEventListener("submit", handleContactSubmit);
  els.contactCopySummary?.addEventListener("click", copyContactSummary);
}

function initMobileNav() {
  navHost = document.querySelector(".site-header.nav-ready");
  if (!navHost) return;
  const headerInner = navHost.querySelector(".header-inner");
  navActions = navHost.querySelector(".header-actions");
  if (!headerInner || !navActions) return;

  navToggle = navHost.querySelector("#navToggle") || navHost.querySelector(".nav-toggle");
  if (!navToggle) {
    navToggle = document.createElement("button");
    navToggle.type = "button";
    navToggle.className = "nav-toggle";
    navToggle.id = "navToggle";
    navToggle.setAttribute("aria-label", "Toggle navigation");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<span class="nav-toggle-box"><span class="nav-toggle-line"></span></span>';
    headerInner.insertBefore(navToggle, navActions);
  }

  navToggle.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) {
      closeNavMenu();
    } else {
      openNavMenu();
    }
  });

  navActions.querySelectorAll("a, button").forEach((node) => {
    node.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 720px)").matches) {
        closeNavMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (!navHost.contains(event.target)) {
      closeNavMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 720px)").matches) {
      closeNavMenu();
    }
  });
}

function openNavMenu() {
  document.body.classList.add("nav-open");
  navHost?.classList.add("nav-open");
  navActions?.setAttribute("data-open", "true");
  navToggle?.setAttribute("aria-expanded", "true");
}

function closeNavMenu() {
  document.body.classList.remove("nav-open");
  navHost?.classList.remove("nav-open");
  navActions?.removeAttribute("data-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function isChemicalModalOpen() {
  return Boolean(els.chemicalModal) && !els.chemicalModal.hidden;
}

function cleanChemicalName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const withoutViewMore = raw.replace(/VIEW MORE TESTING DATA/gi, " ");
  const normalized = withoutViewMore.replace(/\s+/g, " ").trim();
  const parts = normalized.split(" ");
  if (parts.length > 12) {
    return parts.slice(-6).join(" ").trim();
  }
  return normalized;
}

function buildChemicalNarrative({ displayName, concerns, category, ratio, unit, utilityValue, guidelineValue, infoEntry }) {
  const description = infoEntry?.description ? String(infoEntry.description).trim() : "";
  const whyAvoid = infoEntry?.whyAvoid ? String(infoEntry.whyAvoid).trim() : "";

  const hasRatio = Number.isFinite(ratio) && ratio > 0;
  const hasNumbers = Number.isFinite(utilityValue) && Number.isFinite(guidelineValue) && guidelineValue > 0;

  let lead = description;
  if (!lead) {
    if (category) {
      lead = `${displayName} is a contaminant that can show up in drinking water. It is commonly grouped under "${category}".`;
    } else {
      lead = `${displayName} is a contaminant that can show up in drinking water.`;
    }
  }

  let impact = whyAvoid;
  if (!impact) {
    const concernSentence = concerns ? `Studies and regulatory assessments associate this contaminant with ${concerns.toLowerCase()}.` : "";
    impact = `${concernSentence} Lower exposure is generally considered better—especially for infants, children, pregnant people, and anyone with underlying health conditions.`.trim();
  }

  let numbers = "";
  if (hasRatio) {
    numbers = `In this water system, it measures about <strong>${escapeHtml(formatMultiplier(ratio))}x</strong> higher than a health-based guideline.`;
  } else if (hasNumbers) {
    numbers = `In this water system, it measures ${escapeHtml(formatNumber(utilityValue))}${unit ? ` ${escapeHtml(unit)}` : ""}, compared with a health-based guideline of ${escapeHtml(
      formatNumber(guidelineValue)
    )}${unit ? ` ${escapeHtml(unit)}` : ""}.`;
  } else {
    numbers = `If you're seeing this contaminant listed, it's worth reducing exposure where practical—especially for drinking and cooking.`;
  }

  return {
    lead,
    numbers,
    impact,
  };
}

async function openChemicalModal(chemical) {
  if (!els.chemicalModal) return;

  const nameRaw = chemical?.name ? String(chemical.name) : "";
  const name = cleanChemicalName(nameRaw);
  const concerns = chemical?.concerns ? String(chemical.concerns) : "";
  const category = chemical?.category ? String(chemical.category) : "";

  const displayMetrics = resolveChemicalDisplayData(chemical);
  const ratio = displayMetrics.ratio;
  const ratioText = Number.isFinite(ratio) ? `${formatMultiplier(ratio)}x above guideline` : "";
  const subtitle = concerns ? `Potential effect: ${concerns}` : ratioText;

  if (els.chemicalModalTitle) els.chemicalModalTitle.textContent = name;
  if (els.chemicalModalSubtitle) els.chemicalModalSubtitle.textContent = subtitle;

  const info = await loadChemicalInfo();
  const entry = info?.[name] || info?.[nameRaw] || null;

  const narrative = buildChemicalNarrative({
    displayName: name,
    concerns,
    category,
    ratio,
    unit: displayMetrics.unit,
    utilityValue: displayMetrics.utilityValue,
    guidelineValue: displayMetrics.guidelineValue,
    infoEntry: entry,
  });

  if (els.chemicalModalBody) {
    els.chemicalModalBody.innerHTML = `
      <div class="chem-card-meta">
        <p class="muted" style="margin: 0 0 10px 0; line-height: 1.5; color: #23313c;">${escapeHtml(
          narrative.lead
        )}</p>
        <p style="margin: 0 0 10px 0; line-height: 1.55; color: #0b1720;">${narrative.numbers}</p>
        <p class="muted" style="margin: 0; line-height: 1.5; color: #23313c;">${escapeHtml(narrative.impact)}</p>
      </div>
    `;
  }

  els.chemicalModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeChemicalModal() {
  if (!isChemicalModalOpen()) return;
  els.chemicalModal.hidden = true;
  document.body.style.overflow = "";
}

function parseNumber(value) {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.+-eE]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) >= 100) return String(Math.round(n));
  if (Math.abs(n) >= 10) return n.toFixed(1).replace(/\.0$/, "");
  if (Math.abs(n) >= 1) return n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return n.toPrecision(2);
}

function getChemicalKey(chemical) {
  return String(chemical?.name || "").trim().toLowerCase();
}

function resolveGuidelineInfo(chemical) {
  const key = getChemicalKey(chemical);
  const explicit = parseNumber(chemical?.guidelineValue);
  const explicitUnit = chemical?.unit ? String(chemical.unit) : "";

  if (Number.isFinite(explicit) && explicit > 0) {
    return { value: explicit, unit: explicitUnit || GUIDELINE_FALLBACKS[key]?.unit || "", source: "reported" };
  }

  const fallback = GUIDELINE_FALLBACKS[key];
  if (fallback) {
    return { value: fallback.value, unit: fallback.unit, source: "reference" };
  }

  return { value: NaN, unit: explicitUnit, source: "unknown" };
}

function getFallbackMultiplier(chemical) {
  const explicit = parseNumber(chemical?.multiplier);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const key = getChemicalKey(chemical);
  const hint = MULTIPLIER_HINTS[key];
  if (Number.isFinite(hint) && hint > 0) return hint;

  const level = String(chemical?.level || "").toLowerCase();
  const levelHint = LEVEL_MULTIPLIER_HINTS[level];
  if (Number.isFinite(levelHint) && levelHint > 0) return levelHint;

  return NaN;
}

function resolveChemicalDisplayData(chemical) {
  const guideline = resolveGuidelineInfo(chemical);
  const reportedUtility = parseNumber(chemical?.thisUtilityValue);

  let ratio = NaN;
  let ratioSource = "unknown";

  if (Number.isFinite(reportedUtility) && Number.isFinite(guideline.value) && guideline.value > 0) {
    ratio = reportedUtility / guideline.value;
    ratioSource = "reported";
  }

  if (!Number.isFinite(ratio)) {
    const fallbackRatio = getFallbackMultiplier(chemical);
    if (Number.isFinite(fallbackRatio) && fallbackRatio > 0) {
      ratio = fallbackRatio;
      if (ratioSource === "unknown") ratioSource = "estimated";
    }
  }

  let utilityValue = reportedUtility;
  let utilitySource = Number.isFinite(reportedUtility) ? "reported" : "unknown";
  if (!Number.isFinite(utilityValue) && Number.isFinite(ratio) && Number.isFinite(guideline.value) && guideline.value > 0) {
    utilityValue = guideline.value * ratio;
    utilitySource = "derived";
  }

  const unit = chemical?.unit ? String(chemical.unit) : guideline.unit;

  return {
    ratio,
    ratioSource,
    utilityValue,
    utilitySource,
    guidelineValue: guideline.value,
    guidelineSource: guideline.source,
    unit,
  };
}

function calcMultiplier(chemical) {
  const display = resolveChemicalDisplayData(chemical);
  return display.ratio;
}

function formatMultiplier(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return "";
  if (ratio >= 100) return String(Math.round(ratio));
  if (ratio >= 10) return ratio.toFixed(0);
  if (ratio >= 1) return ratio.toFixed(1).replace(/\.0$/, "");
  return ratio.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function hydrateFromStorage() {
  const state = loadState();
  if (!state) return;

  if (els.zipInline) {
    els.zipInline.value = state.zip || "";
  }

  renderResults(state).catch(() => {
    // If something goes wrong, clear and ask again.
    clearState();
    openModal();
  });
}

async function findUtilities(zip) {
  // Avoid refetching the same ZIP repeatedly.
  if (zip === lastZipSearched && !els.utilityRow.hidden) {
    updatePrimaryButton();
    return;
  }

  lastZipSearched = zip;
  const requestVersion = ++utilitiesRequestVersion;
  setModalLoading(true, "Finding utilities...");

  try {
    const utilities = await DatasetProvider.getUtilitiesByZip(zip);

    // Ignore stale async results (e.g., saved ZIP fetch finishing after user typed a new ZIP).
    if (requestVersion !== utilitiesRequestVersion) {
      setModalLoading(false);
      return;
    }

    const currentZip = sanitizeZip(els.zipInput.value);
    if (currentZip !== zip) {
      setModalLoading(false);
      return;
    }

    if (!utilities || utilities.length === 0) {
      const extra = lastUtilitiesLookupDebug ? `\n\nDebug: ${lastUtilitiesLookupDebug}` : "";
      showModalError(
        "We don't have coverage for that ZIP yet. Please try another ZIP, or contact us to add your utility." + extra
      );

      els.utilityRow.hidden = true;
      els.utilityHelp.textContent = "";
      els.utilitySelect.innerHTML = '<option value="" selected disabled>Select your utility</option>';
      els.utilitySelect.value = "";
      updatePrimaryButton();

      setModalLoading(false);
      return;
    }

    populateUtilities(utilities);
    els.utilityRow.hidden = false;
    els.utilityHelp.textContent = `Found ${utilities.length} option${utilities.length === 1 ? "" : "s"}.`;

    // If there is exactly one utility, auto-select it so the user can continue.
    if (utilities.length === 1 && utilities[0]?.id) {
      els.utilitySelect.value = utilities[0].id;
    } else {
      // Force the user to pick for each ZIP (don't keep an old utility selection).
      els.utilitySelect.value = "";
    }

    updatePrimaryButton();
    setModalLoading(false);

    els.utilitySelect.focus();
  } catch {
    showModalError("Something went wrong finding utilities. Please try again.");
    setModalLoading(false);
  }
}

async function renderResults(state) {
  const { zip, utilityId, utilityName, utilityRegion } = state;

  setResultsLoading(true);

  try {
    const chemicals = await DatasetProvider.getChemicalsByUtilityId(utilityId);

    if (!chemicals || chemicals.length === 0) {
      setResultsLoading(false);
      els.resultsEmpty.hidden = true;
      els.results.hidden = false;

      els.resultsMeta.innerHTML = buildMetaHtml({ zip, utilityName, utilityRegion, count: 0 });
      els.chemicalsSubtitle.textContent = "Chemical data is not available for this utility yet.";

      if (els.chemCards) {
        els.chemCards.hidden = true;
        els.chemCards.innerHTML = "";
      }
      els.chemTableBody.innerHTML = "";

      showNotice(
        "We found your utility, but we don't have chemical data for it yet. Please contact us to add your water report."
      );

      saveState({ zip, utilityId, utilityName, utilityRegion });
      return true;
    }

    els.resultsEmpty.hidden = true;
    els.results.hidden = false;

    els.resultsMeta.innerHTML = buildMetaHtml({ zip, utilityName, utilityRegion, count: chemicals.length });
    els.chemicalsSubtitle.innerHTML = `<span>Exceed Guidelines</span><span>Other Detected</span>`;

    if (els.zipInline) {
      els.zipInline.value = zip;
    }
    if (els.contactZipField && !els.contactZipField.value) {
      els.contactZipField.value = zip;
    }

    if (els.chemCards) {
      els.chemCards.hidden = false;
      els.chemCards.innerHTML = chemicals
        .map((c) => {
          const display = resolveChemicalDisplayData(c);
          const ratio = display.ratio;
          const hasRatio = Number.isFinite(ratio) && ratio > 0;
          const unit = display.unit ? String(display.unit) : "";
          const utilityText = Number.isFinite(display.utilityValue)
            ? `${formatNumber(display.utilityValue)}${unit ? ` ${unit}` : ""}`
            : "";
          const guidelineText = Number.isFinite(display.guidelineValue)
            ? `${formatNumber(display.guidelineValue)}${unit ? ` ${unit}` : ""}`
            : "";
          const utilityEstimated = display.utilitySource !== "reported";
          const guidelineEstimated = display.guidelineSource !== "reported";

          return `
            <div class="chem-card chem-card-entry" data-chem-name="${escapeHtml(c.name)}">
              <div class="chem-card-top">
                <div>
                  <div class="chem-card-name">${escapeHtml(c.name)}</div>
                  <div class="chem-card-effect">Potential effect: ${escapeHtml(c.concerns || "")}</div>
                </div>
                <button class="chem-card-open" type="button" data-chem-open="1" aria-label="More about ${escapeHtml(
                  c.name
                )}">
                  <span class="chem-card-open-icon" aria-hidden="true">↗</span>
                </button>
              </div>

              <div class="chem-card-pills">
                ${utilityText ? `<span class="chem-pill">This Utility: ${escapeHtml(
                  utilityEstimated ? `${utilityText} (est.)` : utilityText
                )}</span>` : ""}
                <span class="chem-pill chem-pill-muted">No Legal Limit</span>
                ${guidelineEstimated ? `<span class="chem-pill chem-pill-muted">Guideline ref</span>` : ""}
                ${!utilityText && !guidelineText ? `<span class="chem-pill chem-pill-muted">${escapeHtml(c.category || "")}</span>` : ""}
              </div>

              ${hasRatio ? `<div class="chem-card-mult"><div class="chem-mult-value">${escapeHtml(
                formatMultiplier(ratio)
              )}x</div><div class="chem-mult-sub">Health guideline${
                guidelineEstimated ? " (reference)" : ""
              }: ${escapeHtml(guidelineText || "not available")}</div></div>` : `<div class="chem-card-fallback"><div class="chem-card-meta"><div class="chem-card-row"><div class="chem-card-label">Category</div><div class="chem-card-value">${escapeHtml(
                c.category
              )}</div></div></div></div>`}
            </div>
          `;
        })
        .join("");

      // Click handling for arrow buttons (event delegation)
      els.chemCards.querySelectorAll('[data-chem-open="1"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const card = btn.closest(".chem-card");
          const name = card?.getAttribute("data-chem-name") || "";
          const chemical = chemicals.find((x) => String(x?.name || "") === String(name));
          if (chemical) void openChemicalModal(chemical);
        });
      });
    }

    els.chemTableBody.innerHTML = chemicals
      .map((c) => {
        const level = normalizeLevel(c.level);
        const levelLabel = levelToLabel(level);
        return `
          <tr>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${escapeHtml(c.category)}</td>
            <td>${escapeHtml(c.concerns)}</td>
            <td>
              <span class="level level-${level}">
                <span class="level-dot" aria-hidden="true"></span>
                ${escapeHtml(levelLabel)}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");

    saveState({ zip, utilityId, utilityName, utilityRegion });
    setResultsLoading(false);
    return true;
  } catch {
    setResultsLoading(false);
    showNotice("Something went wrong loading results. Please try again.");
    return false;
  }
}

function buildMetaHtml({ zip, utilityName, utilityRegion, count }) {
  const safeName = escapeHtml(utilityName || "Selected utility");
  const safeRegion = escapeHtml(utilityRegion || "");

  return `
    <div>
      <div class="badges" aria-label="Selected location">
        <span class="badge">ZIP: ${escapeHtml(zip)}</span>
        <span class="badge">Utility: ${safeName}${safeRegion ? ` (${safeRegion})` : ""}</span>
        <span class="badge">Chemicals: ${escapeHtml(String(count))}</span>
      </div>
    </div>
  `;
}

function populateUtilities(utilities) {
  const current = els.utilitySelect.value;

  els.utilitySelect.innerHTML = `
    <option value="" selected disabled>Select your utility</option>
    ${utilities
      .map(
        (u) =>
          `<option value="${escapeHtml(u.id)}" data-region="${escapeHtml(u.region)}">${escapeHtml(u.name)}</option>`
      )
      .join("")}
  `;

  if (current) {
    els.utilitySelect.value = current;
  }
}

function resetModal() {
  if (!els.zipInput) return;
  els.zipInput.value = "";
  els.utilityRow.hidden = true;
  els.utilityHelp.textContent = "";
  els.utilitySelect.innerHTML = '<option value="" selected disabled>Select your utility</option>';
  clearModalError();
  setModalLoading(false);
  lastZipSearched = "";
  updatePrimaryButton();
}

function updatePrimaryButton() {
  if (els.utilityRow.hidden) {
    els.modalPrimaryBtn.textContent = "Find utilities";
    return;
  }

  const hasUtility = Boolean(els.utilitySelect.value);
  els.modalPrimaryBtn.textContent = hasUtility ? "See chemicals" : "Select a utility";
}

function openModal(prefill) {
  if (!els.zipModal) {
    window.location.href = "index.html#resultsHeading";
    return;
  }

  lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  els.zipModal.hidden = false;
  document.body.style.overflow = "hidden";

  const target = prefill && prefill.zip ? prefill : loadState();

  if (target?.zip) {
    els.zipInput.value = target.zip;
    els.utilityRow.hidden = false;
    findUtilities(target.zip).then(() => {
      if (target.utilityId) {
        els.utilitySelect.value = target.utilityId;
      }
      updatePrimaryButton();
    });
  } else {
    resetModal();
  }

  trapFocus(els.zipModal);
  setTimeout(() => {
    els.zipInput.focus();
  }, 0);
}

function closeModal() {
  if (!isModalOpen()) return;
  els.zipModal.hidden = true;
  document.body.style.overflow = "";
  releaseFocusTrap();

  if (lastFocusedEl) lastFocusedEl.focus();
}

function isModalOpen() {
  return Boolean(els.zipModal) && !els.zipModal.hidden;
}

function setModalLoading(isLoading, label) {
  if (!els.modalPrimaryBtn || !els.zipInput) return;

  els.modalPrimaryBtn.disabled = isLoading;
  els.resetModalBtn.disabled = isLoading;
  els.zipInput.disabled = isLoading;
  els.utilitySelect.disabled = isLoading;

  if (isLoading) {
    els.modalPrimaryBtn.dataset.prevText = els.modalPrimaryBtn.textContent;
    els.modalPrimaryBtn.textContent = label || "Loading";
  } else {
    const prev = els.modalPrimaryBtn.dataset.prevText;
    if (prev) els.modalPrimaryBtn.textContent = prev;
    delete els.modalPrimaryBtn.dataset.prevText;
    updatePrimaryButton();
  }
}

function setResultsLoading(isLoading) {
  if (isLoading) {
    showNotice("Loading water results");
  } else {
    hideNotice();
  }
}

function showModalError(message) {
  els.modalError.textContent = message;
  els.modalError.hidden = false;
}

function clearModalError() {
  els.modalError.textContent = "";
  els.modalError.hidden = true;
}

function showNotice(message) {
  els.notice.textContent = message;
  els.notice.hidden = false;
}

function hideNotice() {
  els.notice.textContent = "";
  els.notice.hidden = true;
}

function sanitizeZip(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

function isValidZip(zip) {
  return /^\d{5}$/.test(zip);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeLevel(level) {
  const v = String(level || "").toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return "low";
}

function levelToLabel(level) {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  return "Low";
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let focusTrapCleanup = null;

function trapFocus(modalRoot) {
  if (!modalRoot) return;

  const focusable = () =>
    Array.from(
      modalRoot.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el instanceof HTMLElement && !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;

    const items = focusable();
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  modalRoot.addEventListener("keydown", onKeyDown);
  focusTrapCleanup = () => modalRoot.removeEventListener("keydown", onKeyDown);
}

function releaseFocusTrap() {
  if (focusTrapCleanup) focusTrapCleanup();
  focusTrapCleanup = null;
}
