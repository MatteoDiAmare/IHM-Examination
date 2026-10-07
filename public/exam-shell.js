import { collectSourceFiles, sourceSection } from "./submission.js";
import { scoringRules, scoreSummary } from "./scoring.js";
import { answerEntries, legacyEntries } from "./answers.js";
import {
  clearNavigation,
  restoreNavigation,
  saveNavigation,
  savedSessionId,
} from "./navigation.js";
import {
  backupFilename,
  createBackup,
  maxBackupBytes,
  parseBackup,
  validateSession,
} from "./backup.js";
// Navigation och provsvar bor här. Uppgifternas kod finns i missions/.
const words = {
  sv: {
    eyebrow: "DITT UPPDRAG · RÄDDA PREMIÄREN",
    headline: "Musiken väntar.<br>Du har kontrollen.",
    intro:
      "Sex saker har gått snett inför premiären. Kliv in backstage, följ spåren i DevTools och hjälp musikplattformen tillbaka på scen.",
    note: "Du kan visa din förståelse även om du inte löser all kod. Spara ditt resonemang och gå vidare — du kan alltid komma tillbaka.",
    first: "Förnamn",
    last: "Efternamn",
    start: "Starta uppdraget →",
    resume: "Fortsätt ditt uppdrag →",
    local:
      "Dina svar sparas på den här datorn. Rapporten lämnar du själv på lärplattformen.",
    map: "Din uppdragskarta",
    mapIntro: "Välj ett uppdrag. Undersök, testa och berätta vad du upptäcker.",
    solved: "tekniska uppdrag klara",
    answers: "resonemang sparade",
    ready: "Teknisk lösning klar",
    review: "Resonemang sparat",
    pending: "Redo att undersöka",
    report: "Till examinationsrapporten →",
    back: "← Uppdragskartan",
    reload: "Ladda om spelaren",
    check: "Kontrollera lösningen",
    hint: "Visa en ledtråd",
    file: "Arbeta i den här filen i VS Code",
    reflect: "Berätta vad du upptäckte",
    observation: "Vad såg du i DevTools?",
    cause: "Vad tror du orsakar problemet?",
    solution: "Hur löser du det — och varför?",
    save: "Spara resonemang",
    saved: "Sparat i webbläsaren och på den lokala servern",
    fallback:
      "Sparat i webbläsaren. Serverkopian kunde inte sparas; exportera gärna en rapport.",
    failed:
      "Inte riktigt ännu. Fortsätt undersöka, eller spara ditt resonemang och gå vidare.",
    success: "Snyggt! Funktionen klarar den tekniska kontrollen.",
    checking: "Kontrollerar…",
    timeout:
      "Ingen kontroll kunde slutföras. Dina resonemang går fortfarande att spara.",
    reportTitle: "Din insats, samlad.",
    reportIntro:
      "Här finns det du har löst och det du har förklarat. Ladda ned HTML-inlämningen med svar och kod och lämna den på lärplattformen.",
    html: "Ladda ned inlämningen (HTML)",
    finish: "Avsluta och spara",
    finished: "Provet är avslutat. Du kan fortfarande ladda ned rapporten.",
    grading:
      "Tekniska kontroller visar vilka funktioner som fungerar. Läraren bedömer dina förklaringar och fastställer betyget G eller VG.",
    provisional:
      "Alla sex tekniska G-uppdrag är klara! Resonemangen återstår för lärarbedömning.",
    vg: "Encore är frivilligt. Kontrollen testar hämtning och visning; felhantering och VG bedöms av läraren.",
    time: "Förfluten tid",
    new: "Starta ett nytt test",
    reset:
      "Starta ett nytt test? Spara först en säkerhetskopia om du vill behålla den här omgången.",
    empty: "Inget svar ännu",
    attempts: "Kontrollförsök",
    continue: "Nästa uppdrag →",
    clickFirst:
      "Klicka på uppgiftens knapp inne i spelaren först (efter varje omladdning), och välj sedan Kontrollera lösningen.",
    restored: "Dina svar återställdes från den lokala servern.",
    savedServerOnly:
      "Sparat på den lokala servern, men INTE i webbläsaren. Spara en säkerhetskopia nu.",
    savedNone:
      "Kunde inte spara varken i webbläsaren eller på servern. Spara en säkerhetskopia nu.",
    backup: "Spara en säkerhetskopia av mina svar",
    backupNote:
      "Säkerhetskopian innehåller dina svar och framsteg. Spara kodändringar separat i VS Code.",
    backupDone:
      "Nedladdningen av säkerhetskopian startades: {file}. Kontrollera att filen finns i din nedladdningsmapp.",
    backupFailed:
      "Säkerhetskopian kunde inte skapas. Dina svar finns kvar i den öppna sidan — försök igen.",
    backupReminder:
      "Påminnelse: spara gärna en säkerhetskopia av dina svar innan du går vidare.",
    lastBackup: "Senast i den här sidan:",
    importBackup: "Återställ från säkerhetskopia",
    importFailed:
      "Filen kunde inte användas som säkerhetskopia. Dina nuvarande svar är oförändrade.",
    importConfirm: "Återställa säkerhetskopian för {name}, sparad {time}?",
    importReplace:
      "Dina nuvarande svar för {current} (senast sparade {saved}) ersätts. Spara först en säkerhetskopia om du vill behålla dem.",
    importDone: "Säkerhetskopian återställdes i den öppna sidan.",
    submitVsBackup:
      "Säkerhetskopian är bara till för dig: den kan återställa dina svar om något går fel och lämnas inte in. Inlämningen (HTML) innehåller svar och sparad kod och är filen du lämnar på lärplattformen.",
    restorePrev: "Återställ tidigare prov",
    restoreListTitle: "Sparade omgångar på den här serverns dator",
    restoreNone: "Inga sparade omgångar hittades på servern.",
    restoreListFailed:
      "Kunde inte hämta listan. Kontrollera att servern körs (npm start) och försök igen.",
    restoreLoad: "Återställ",
    restoreSaved: "Senast sparad",
    restoreFinished: "avslutad",
    restoreFailed:
      "Dina svar kunde inte hämtas från servern just nu. Ditt sessions-ID finns kvar, så du kan försöka igen.",
    restoreInvalid:
      "Serverkopian kunde inte användas. Prova en säkerhetskopia eller en annan sparad omgång.",
    retryRestore: "Försök återställa igen",
    retrying: "Försöker…",
    loading: "Hämtar…",
  },
  en: {
    eyebrow: "YOUR MISSION · SAVE OPENING NIGHT",
    headline: "The music is waiting.<br>You’re in control.",
    intro:
      "Six things have gone wrong before opening night. Step backstage, follow the clues in DevTools and bring the music platform back on stage.",
    note: "You can show understanding even when your code is unfinished. Save your reasoning and move on — you can always return.",
    first: "First name",
    last: "Last name",
    start: "Start mission →",
    resume: "Continue your mission →",
    local:
      "Answers are saved on this computer. You submit the exported report on your learning platform.",
    map: "Your mission map",
    mapIntro:
      "Pick a mission. Investigate, test and tell us what you discover.",
    solved: "technical missions complete",
    answers: "reasoning responses saved",
    ready: "Technical solution complete",
    review: "Reasoning saved",
    pending: "Ready to investigate",
    report: "Open examination report →",
    back: "← Mission map",
    reload: "Reload player",
    check: "Check solution",
    hint: "Reveal a clue",
    file: "Work in this file in VS Code",
    reflect: "Tell us what you discovered",
    observation: "What did you see in DevTools?",
    cause: "What do you think caused the problem?",
    solution: "How would you fix it — and why?",
    save: "Save reasoning",
    saved: "Saved in the browser and on the local server",
    fallback:
      "Saved in the browser. The server copy could not be saved; consider exporting a report.",
    failed:
      "Not quite yet. Keep investigating, or save your reasoning and move on.",
    success: "Nice! The function passes the technical check.",
    checking: "Checking…",
    timeout: "The check could not finish. You can still save your reasoning.",
    reportTitle: "Your work, all together.",
    reportIntro:
      "Here is what you fixed and what you explained. Download the HTML submission with answers and code and submit it on the learning platform.",
    html: "Download submission (HTML)",
    finish: "Finish and save",
    finished: "The exam is finished. You can still download the report.",
    grading:
      "Technical checks show which functions work. Your teacher assesses your explanations and determines your G or VG grade.",
    provisional:
      "All six technical G missions are complete! Reasoning still needs teacher assessment.",
    vg: "Encore is optional. The check tests fetching and rendering; error handling and VG need teacher assessment.",
    time: "Elapsed time",
    new: "Start a new test",
    reset:
      "Start a new test? Save a backup first if you want to keep this attempt.",
    empty: "No answer yet",
    attempts: "Check attempts",
    continue: "Next mission →",
    clickFirst:
      "Click the mission’s button inside the player first (after every reload), then choose Check solution.",
    restored: "Your answers were restored from the local server.",
    savedServerOnly:
      "Saved on the local server, but NOT in the browser. Save a backup now.",
    savedNone:
      "Could not save in the browser or on the server. Save a backup now.",
    backup: "Save a backup of my answers",
    backupNote:
      "The backup contains your answers and progress. Save code changes separately in VS Code.",
    backupDone:
      "The backup download has started: {file}. Check that the file is in your downloads folder.",
    backupFailed:
      "The backup could not be created. Your answers are still in the open page — try again.",
    backupReminder:
      "Reminder: consider saving a backup of your answers before moving on.",
    lastBackup: "Most recent in this page:",
    importBackup: "Restore from backup",
    importFailed:
      "The file could not be used as a backup. Your current answers are unchanged.",
    importConfirm: "Restore the backup for {name}, saved {time}?",
    importReplace:
      "Your current answers for {current} (last saved {saved}) will be replaced. Save a backup first if you want to keep them.",
    importDone: "The backup was restored in the open page.",
    submitVsBackup:
      "The backup is only for you: it can restore your answers if something goes wrong and is not submitted. The submission (HTML) contains answers and saved code and is the file you hand in on the learning platform.",
    restorePrev: "Restore a previous exam",
    restoreListTitle: "Saved attempts on this computer’s server",
    restoreNone: "No saved attempts were found on the server.",
    restoreListFailed:
      "Could not fetch the list. Check that the server is running (npm start) and try again.",
    restoreLoad: "Restore",
    restoreSaved: "Last saved",
    restoreFinished: "finished",
    restoreFailed:
      "Your answers could not be fetched from the server right now. Your session ID is kept, so you can try again.",
    restoreInvalid:
      "The server copy could not be used. Try a backup or another saved attempt.",
    retryRestore: "Try to restore again",
    retrying: "Trying…",
    loading: "Loading…",
  },
};
const missions = await fetch("/missions.json").then((r) => r.json());
const key = "backstage-exam-v1";
let state;
try {
  state = JSON.parse(localStorage.getItem(key));
} catch {}
if (state?.version !== "0.1.0" || !Array.isArray(state.missions)) state = null;
// Hämta en sparad omgång från den lokala servern och validera den innan den används.
// Fetch a saved attempt from the local server and validate it before use.
async function fetchSession(id) {
  try {
    const res = await fetch("/api/sessions/" + encodeURIComponent(id), {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) return { transient: true };
    const checked = validateSession(
      await res.json(),
      missions.map((m) => m.id),
    );
    if (checked.error || checked.session.id !== id) return { invalid: true };
    return { session: checked.session };
  } catch {
    // Nätverksfel, timeout eller avbruten läsning: tillfälligt, ID:t behålls.
    return { transient: true };
  }
}
// Om webbläsarlagringen rensats men fliken minns sessions-ID:t: hämta serverkopian.
// Misslyckas hämtningen behålls ID:t så att eleven kan försöka igen.
// If browser storage was cleared but the tab remembers the session ID, restore the server copy.
// If the fetch fails the ID is kept so the student can try again.
let restored = false;
let pendingRestoreId = null;
if (!state) {
  const savedId = savedSessionId(sessionStorage);
  if (savedId) {
    const result = await fetchSession(savedId);
    if (result.session) {
      state = result.session;
      restored = true;
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {}
    } else if (result.transient) pendingRestoreId = savedId;
  }
}
const navigation = restoreNavigation(sessionStorage, state);
let lang = state?.language || "sv";
let view = navigation.view;
let current = navigation.current;
let saveQueue = Promise.resolve();
let saveRevision = 0;
const app = document.querySelector("#app");
const language = document.querySelector("#language");
language.value = lang;
const t = (k) => words[lang][k];
// Favoritövningen ligger utanför provsvaren och måste nollställas mellan omgångar.
// The favourite exercise lives outside exam answers and must be reset between attempts.
const clearFavourite = () => {
  try {
    localStorage.removeItem("backstage-favourite");
  } catch {}
};
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const answer = (m) => Object.values(m.answers).some((v) => v.trim());
function toast(message) {
  document.querySelector("#notice").textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(
    () => (document.querySelector("#notice").textContent = ""),
    5000,
  );
}
const timeFormat = () => (lang === "sv" ? "sv-SE" : "en-GB");
const formatTime = (iso) =>
  iso && !Number.isNaN(Date.parse(iso))
    ? new Date(iso).toLocaleString(timeFormat(), {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
// Vad som faktiskt sparats senast: webbläsaren och servern redovisas var för sig.
// What was actually saved last: browser and server are reported separately.
const saveInfo = { browser: null, server: null, at: null };
let lastBackupAt = null;
function saveText() {
  const at = saveInfo.at
    ? " (" +
      saveInfo.at.toLocaleTimeString(timeFormat(), {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      ")"
    : "";
  if (saveInfo.browser && saveInfo.server) return t("saved") + at;
  if (saveInfo.browser) return t("fallback") + at;
  if (saveInfo.server) return t("savedServerOnly") + at;
  return t("savedNone");
}
function syncPosition() {
  if (["tutorial", "map", "mission", "report"].includes(view))
    state.position = { view, current };
}
// Spara provsvar i webbläsaren och köa en lokal serverkopia. / Persist answers and queue a server backup.
function persist() {
  if (!state) return;
  state.language = lang;
  state.updatedAt = new Date().toISOString();
  syncPosition();
  let browserSaved = true;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    browserSaved = false;
  }
  const payload = JSON.stringify(state),
    sessionId = state.id,
    revision = ++saveRevision;
  saveQueue = saveQueue
    .catch(() => {})
    .then(async () => {
      let saved = false;
      try {
        const res = await fetch("/api/sessions/" + sessionId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          signal: AbortSignal.timeout(5000),
        });
        saved = res.ok;
      } catch {}
      if (revision === saveRevision) {
        saveInfo.browser = browserSaved;
        saveInfo.server = saved;
        if (browserSaved || saved) saveInfo.at = new Date();
        const label = document.querySelector("#saveStatus");
        if (label) label.textContent = saveText();
        if (!browserSaved && !saved)
          toast(
            lang === "sv"
              ? "Kunde inte spara. Spara en säkerhetskopia nu."
              : "Unable to save. Save a backup now.",
          );
      }
    });
}
// Behåll samma uppdrag när hela webbsidan laddas om. / Restore the current mission on reload.
function render() {
  saveNavigation(sessionStorage, state, view, current);
  document.documentElement.lang = lang;
  language.value = lang;
  if (view === "welcome") welcome();
  if (view === "map") map();
  if (view === "mission") mission();
  if (view === "report") report();
  if (view === "tutorial") tutorial();
}
// Visa namnformulär eller återuppta en tidigare omgång. / Show entry form or resume.
// Gemensamma kriterier visas i båda språken och följer med rapporten.
function criteriaHTML() {
  const sv = lang === "sv";
  return `<details class="criteria"><summary>${sv ? "Poäng och betyg — G 12 p · VG 20 p" : "Points and grades — G 12 pts · VG 20 pts"}</summary>
    <p>${sv ? "Max 24 poäng. G: minst 12 av 18 poäng i uppgift 1–6. VG: minst 20 av 24 poäng totalt, uppfyllda G-krav och 2 av 2 fördjupningspoäng." : "Maximum 24 points. G: at least 12 of 18 points in missions 1–6. VG: at least 20 of 24 points overall, all G requirements and 2 of 2 depth points."}</p>
    <div class="score-table"><table><thead><tr><th>${sv ? "Uppgift" : "Mission"}</th><th>${sv ? "Kod" : "Code"}</th><th>${sv ? "Resonemang" : "Reasoning"}</th><th>${sv ? "Fördjupning" : "Depth"}</th><th>${sv ? "Max" : "Max"}</th></tr></thead><tbody>
    ${scoringRules.missions.map((m) => `<tr><td>${m.id}</td><td>${m.code}</td><td>${m.reasoning}</td><td>${m.depth || "—"}</td><td>${m.code + m.reasoning + m.depth}</td></tr>`).join("")}
    <tr><th>${sv ? "Totalt" : "Total"}</th><td>11</td><td>11</td><td>2</td><th>24</th></tr></tbody></table></div>
    <p>${sv ? "För G behöver du visa grundläggande förståelse inom samtliga fem läranderesultat: klient/server och datainsamling; identifiering och spårning; JavaScript; HTML; samt ändring av identifierings- eller spårningskod. Det ska finnas en enkel fungerande HTML-ändring och en enkel fungerande ändring i identifierings-/spårningskoden. Poängsumman ensam räcker inte." : "G requires basic understanding across all five learning outcomes: client/server and data collection; identification and tracking; JavaScript; HTML; and modifying identification or tracking code. Include a simple working HTML change and a simple working change to identification/tracking code. The points total alone is not enough."}</p>
    <p>${sv ? "Resonemang: 1 p för en relevant och huvudsakligen korrekt grundförklaring; 2 p när du också förklarar hur och varför; 3 p i uppgift 6 när du dessutom skiljer ett besökar-ID från en känd person och förklarar vad ID:t kan och inte kan visa. Fördjupning: 1 p för konkret analys av din kod; 2 p när du även motiverar lösningen, visar hur du kontrollerat den och analyserar en relevant risk eller begränsning med ett förbättringsförslag." : "Reasoning: 1 point for a relevant, mainly correct basic explanation; 2 points when you also explain how and why; 3 points in mission 6 when you also distinguish a visitor ID from a known person and explain what the ID can and cannot show. Depth: 1 point for concrete analysis of your code; 2 points when you also justify your solution, explain how you tested it and analyse a relevant risk or limitation with a suggested improvement."}</p>
    <p>${sv ? "Kodkontroller ger högst 10 poäng direkt. I uppgift 7 ger hämtning och visning 1 p; den andra kodpoängen kräver fungerande hantering av HTTP- och nätverksfel och bedöms av läraren. Svar och slutbetyg bedöms efter inlämning. Ett sparat svar ger inte automatiskt poäng." : "Code checks award up to 10 points immediately. In mission 7, fetching and displaying earns 1 point; the second code point requires working HTTP and network error handling and is assessed by the teacher. Answers and the final grade are assessed after submission. A saved answer does not automatically earn points."}</p>
  </details>`;
}

function pointsHTML() {
  const score = scoreSummary(state?.missions);
  const sv = lang === "sv";
  return `<section class="panel score-panel"><div class="eyebrow">${sv ? "DINA POÄNG" : "YOUR POINTS"}</div><strong class="score-total">${score.automaticPoints} / ${score.automaticMaximum}</strong><p>${sv ? "Tekniska kontrollpoäng · 14 poäng återstår för lärarbedömning." : "Technical check points · 14 points require teacher assessment."}</p><p class="muted">${sv ? "Slutpoäng och betyg: inväntar bedömning. G kräver 12 p i uppgift 1–6 och grundläggande kunskaper i alla fem läranderesultat. VG kräver 20 p och full fördjupning." : "Final score and grade: awaiting assessment. G requires 12 points in missions 1–6 and basic knowledge across all five learning outcomes. VG requires 20 points and full depth marks."}</p>${criteriaHTML()}</section>`;
}

function missionPointsHTML(id) {
  const m = scoreSummary(state.missions).missions[id - 1];
  return `<p class="mission-points">${lang === "sv" ? `Kod: ${m.automaticPoints}/${m.code} p · Resonemang: upp till ${m.reasoning} p` : `Code: ${m.automaticPoints}/${m.code} pts · Reasoning: up to ${m.reasoning} pts`}${m.depth ? (lang === "sv" ? ` · Fördjupning: upp till ${m.depth} p` : ` · Depth: up to ${m.depth} pts`) : ""}</p>`;
}

function welcome() {
  app.innerHTML = /* HTML */ `<section class="hero">
    <div>
      <div class="eyebrow">${t("eyebrow")}</div>
      <h1>${t("headline")}</h1>
      <p class="muted">${t("intro")}</p>
      <div class="chips">
        <span class="chip">6 MISSIONS</span
        ><span class="chip">DEVTOOLS + CODE</span
        ><span class="chip">SV / EN</span>
      </div>
      <div class="panel entry">
        ${pendingRestoreId && !state
          ? `<div class="restore-problem" role="alert"><p>${t("restoreFailed")}</p><button class="primary" id="retryRestore">${t("retryRestore")}</button><p id="retryStatus" role="status" class="save-status"></p></div>`
          : ""}
        <p>${t("note")}</p>
        ${state
          ? `<p>${esc(state.firstName)} ${esc(state.lastName)}</p><button class="primary" id="resume">${t("resume")}</button><button class="ghost" id="new">${t("new")}</button>`
          : `<form id="start"><div class="name-row"><label class="field">${t("first")}<input name="first" required maxlength="80" autocomplete="given-name"></label><label class="field">${t("last")}<input name="last" required maxlength="80" autocomplete="family-name"></label></div><button class="primary">${t("start")}</button></form>`}
        <p class="save-status">${t("local")}</p>
        <div class="actions restore-tools">
          <button class="ghost" id="restorePrev">${t("restorePrev")}</button>
          <button class="ghost" id="restoreBackup">${t("importBackup")}</button>
        </div>
        <div id="restoreList" role="status"></div>
        ${criteriaHTML()}
      </div>
    </div>
    <div class="panel studio">
      <div class="studio-title">
        <span>BACKSTAGE SESSIONS</span><span>VOL. 01</span>
      </div>
      <div class="record"></div>
      <div class="wave">
        ${[12, 22, 38, 48, 28, 18, 40, 50, 32, 20, 35, 46, 25, 12]
          .map((h) => `<i style="height:${h}px"></i>`)
          .join("")}
      </div>
      <p class="muted">
        ${lang === "sv"
          ? "Från trasig plattform till premiär."
          : "From broken platform to opening night."}
      </p>
    </div>
  </section>`;
  document.querySelector("#start")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const first = data.get("first").trim(),
      last = data.get("last").trim();
    if (!first || !last) return;
    state = {
      version: "0.1.0",
      id: crypto.randomUUID(),
      firstName: first,
      lastName: last,
      language: lang,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      missions: missions.map((m) => ({
        id: m.id,
        answers: {},
        attempts: [],
        passed: false,
      })),
    };
    clearFavourite();
    persist();
    view = "tutorial";
    render();
  });
  document.querySelector("#resume")?.addEventListener("click", () => {
    view = state.finishedAt
      ? "report"
      : state.practiceComplete
        ? "map"
        : "tutorial";
    render();
  });
  document.querySelector("#new")?.addEventListener("click", reset);
  document
    .querySelector("#retryRestore")
    ?.addEventListener("click", retryRestore);
  document
    .querySelector("#restorePrev")
    .addEventListener("click", showSessionList);
  document
    .querySelector("#restoreBackup")
    .addEventListener("click", chooseBackupFile);
}
function reset() {
  if (!confirm(t("reset"))) return;
  state = null;
  pendingRestoreId = null;
  localStorage.removeItem(key);
  clearNavigation(sessionStorage);
  clearFavourite();
  view = "welcome";
  render();
}

// Gå in i en återställd omgång med alla svar, kontrollresultat och framsteg.
// Enter a restored attempt with all answers, check results and progress.
function adopt(session) {
  state = session;
  pendingRestoreId = null;
  lang = session.language === "en" ? "en" : "sv";
  language.value = lang;
  const position = session.position;
  if (session.finishedAt) view = "report";
  else if (!session.practiceComplete) view = "tutorial";
  else if (position?.view === "mission") {
    view = "mission";
    current = position.current;
  } else if (position?.view === "report") view = "report";
  else view = "map";
  if (view === "tutorial" || view === "map") current = 1;
  persist();
  render();
}
// Visa ett meddelande där eleven tittar: backup-/återställningsrutan eller en toast.
// Show a message where the student is looking: the backup/restore box or a toast.
function say(message) {
  const box =
    document.querySelector("#backupStatus") ||
    document.querySelector("#restoreList");
  if (box) box.textContent = message;
  else toast(message);
}
function confirmRestore(session, savedAt) {
  let message = t("importConfirm")
    .replace("{name}", session.firstName + " " + session.lastName)
    .replace("{time}", formatTime(savedAt));
  if (state)
    message +=
      "\n\n" +
      t("importReplace")
        .replace("{current}", state.firstName + " " + state.lastName)
        .replace("{saved}", formatTime(state.updatedAt));
  return confirm(message);
}
async function retryRestore() {
  const button = document.querySelector("#retryRestore");
  const status = document.querySelector("#retryStatus");
  button.disabled = true;
  status.textContent = t("retrying");
  const result = await fetchSession(pendingRestoreId);
  if (result.session) {
    adopt(result.session);
    toast(t("restored"));
    return;
  }
  if (result.notFound || result.invalid) {
    pendingRestoreId = null;
    render();
    say(t("restoreInvalid"));
    return;
  }
  button.disabled = false;
  status.textContent = t("restoreFailed");
}
async function showSessionList() {
  const box = document.querySelector("#restoreList");
  box.textContent = t("loading");
  let items;
  try {
    const res = await fetch("/api/sessions", {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    items = await res.json();
    if (!Array.isArray(items)) throw new Error("format");
  } catch {
    box.textContent = t("restoreListFailed");
    return;
  }
  if (!items.length) {
    box.textContent = t("restoreNone");
    return;
  }
  box.innerHTML = `<h4>${t("restoreListTitle")}</h4><ul class="restore-items">${items
    .map(
      (item) =>
        `<li><span><strong>${esc(item.firstName)} ${esc(item.lastName)}</strong><small>${t("restoreSaved")}: ${esc(formatTime(item.updatedAt))}${item.finishedAt ? " · " + t("restoreFinished") : ""}</small></span><button data-restore="${esc(item.id)}">${t("restoreLoad")}</button></li>`,
    )
    .join("")}</ul>`;
  box.querySelectorAll("[data-restore]").forEach((button) => {
    button.onclick = async () => {
      button.disabled = true;
      const result = await fetchSession(button.dataset.restore);
      button.disabled = false;
      if (!result.session) return say(t("restoreInvalid"));
      // Namn och tid syns redan i listan; bekräfta bara om något ersätts.
      // Name and time are already in the list; confirm only when something is replaced.
      if (state && !confirmRestore(result.session, result.session.updatedAt))
        return;
      adopt(result.session);
      toast(t("restored"));
    };
  });
}

// Säkerhetskopia: byggs av det öppna provet, så den fungerar även utan server.
// Backup is built from the open exam, so it works even without a server.
function backupHTML() {
  return `<div class="backup"><div class="actions"><button id="backup">${t("backup")}</button><button id="importBackup" class="ghost">${t("importBackup")}</button></div><small class="muted">${t("backupNote")}</small><p id="backupStatus" role="status" class="save-status"></p></div>`;
}
function wireBackup() {
  document.querySelector("#backup").onclick = downloadBackup;
  document.querySelector("#importBackup").onclick = chooseBackupFile;
}
function downloadBackup() {
  try {
    const now = new Date();
    syncPosition();
    const file = backupFilename(state, now);
    saveFile(file, createBackup(state, now), "application/json");
    lastBackupAt = now;
    say(t("backupDone").replace("{file}", file));
  } catch {
    say(t("backupFailed"));
  }
}
function chooseBackupFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.hidden = true;
  input.onchange = async () => {
    const file = input.files[0];
    input.remove();
    if (file) await importBackupFile(file);
  };
  document.body.append(input);
  input.click();
}
// Allt valideras innan något ersätts; ett fel lämnar nuvarande svar orörda.
// Everything is validated before anything is replaced; an error leaves current answers untouched.
async function importBackupFile(file) {
  let result;
  try {
    if (file.size > maxBackupBytes) result = { error: "too-large" };
    else
      result = parseBackup(
        await file.text(),
        missions.map((m) => m.id),
      );
  } catch {
    result = { error: "unreadable" };
  }
  if (result.error) {
    say(t("importFailed") + " (" + result.error + ")");
    return;
  }
  const { session, exportedAt } = result;
  if (!confirmRestore(session, exportedAt || session.updatedAt)) return;
  adopt(session);
  toast(t("importDone"));
}
// Visa uppdragens framsteg utan att låsa olösta uppgifter. / Show progress without blocking missions.
function map() {
  const count = state.missions.slice(0, 6).filter((m) => m.passed).length;
  app.innerHTML = /* HTML */ `<div class="topline">
      <div>
        <div class="eyebrow">BACKSTAGE / ${esc(state.firstName)}</div>
        <h2>${t("map")}</h2>
        <button id="practice" class="ghost">
          ${lang === "sv" ? "Öva på provet" : "Practice the exam"}
        </button>
        <p class="muted">${t("mapIntro")}</p>
      </div>
      <button id="report" class="primary">${t("report")}</button>
    </div>
    <div class="panel" style="margin-bottom:24px">
      <div class="topline" style="margin:0">
        <span>${count}/6 ${t("solved")}</span
        ><span class="muted"
          >${state.missions.filter(answer).length}/7 ${t("answers")}</span
        >
      </div>
      <div class="progress">
        <div style="width:${(count / 6) * 100}%"></div>
      </div>
      <small>${t("grading")}</small>${count === 6
        ? `<p class="badge">${t("provisional")}</p>`
        : ""}
    </div>
    ${pointsHTML()}
    <div class="cards">
      ${missions
        .map((m) => {
          const progress = state.missions[m.id - 1];
          return `<button class="mission-card" data-mission="${m.id}"><span class="number">${m.id === 7 ? "ENCORE / VG" : "MISSION / 0" + m.id}</span><h3>${esc(m[lang].title)}</h3><p class="muted">${esc(m[lang].topic)}</p>${missionPointsHTML(m.id)}<span class="badge">${progress.passed ? "✓ " + t("ready") : answer(progress) ? "✎ " + t("review") : "↗ " + t("pending")}</span></button>`;
        })
        .join("")}
    </div>`;
  document.querySelector("#practice").onclick = () => {
    view = "tutorial";
    render();
  };
  document.querySelectorAll("[data-mission]").forEach(
    (el) =>
      (el.onclick = () => {
        current = Number(el.dataset.mission);
        view = "mission";
        render();
      }),
  );
  document.querySelector("#report").onclick = () => {
    view = "report";
    render();
  };
}
// Visa ett uppdrag och dess separata resonemangsfält. / Render one mission and its answer fields.
function mission() {
  const m = missions[current - 1],
    progress = state.missions[current - 1];
  app.innerHTML = /* HTML */ `<button class="ghost" id="back">
      ${t("back")}
    </button>
    <div class="topline" style="margin-top:24px">
      <div>
        <div class="eyebrow">
          ${current === 7 ? "ENCORE / VG" : "MISSION / 0" + current} ·
          ${esc(m[lang].topic)}
        </div>
        <h2>${esc(m[lang].title)}</h2>
      </div>
      <span class="chip" id="technical"
        >${progress.passed ? "✓ " + t("ready") : t("pending")}</span
      >
    </div>
    <div id="missionPoints">${missionPointsHTML(current)}</div>
    <div class="workspace">
      <section class="panel">
        <p>${esc(m[lang].intro)}</p>
        <small class="muted">${t("file")}</small
        ><code class="path">${m.file}</code>
        <p class="save-status">
          ${lang === "sv"
            ? "I DevTools: Sources → localhost → missions → " +
              String(current).padStart(2, "0") +
              ". Klicka på filnamnet i Console och kontrollera hela sökvägen."
            : "In DevTools: Sources → localhost → missions → " +
              String(current).padStart(2, "0") +
              ". Click the filename in Console and check its full path."}
        </p>
        <iframe
          id="player"
          title="${esc(m[lang].title)}"
          src="/missions/${String(current).padStart(
            2,
            "0",
          )}/index.html?lang=${lang}"
        ></iframe>
        <div class="actions">
          <button
            id="check"
            class="primary"
            ${state.finishedAt ? "disabled" : ""}
          >
            ${t("check")}</button
          ><button id="reload">${t("reload")}</button>
        </div>
        <p id="checkStatus" role="status" class="muted"></p>
        <details>
          <summary>${t("hint")}</summary>
          <p class="muted">${esc(m[lang].hint)}</p>
        </details>
        ${[4, 6, 7].includes(current)
          ? `<p class="save-status">${t("clickFirst")}</p>`
          : ""}
        ${current === 7 ? `<p class="save-status">${t("vg")}</p>` : ""}
      </section>
      <section class="panel">
        <h3>${t("reflect")}</h3>
        <p class="muted">
          ${lang === "sv"
            ? "Skriv med egna ord. Du kan resonera även om du inte fått koden att fungera."
            : "Use your own words. You can explain your reasoning even if your code is unfinished."}
        </p>
        <form id="reasoning">
          ${m[lang].fields
            .map(
              (field) =>
                `<label class="field">${esc(field.label)}<textarea name="${field.key}" rows="${m[lang].fields.length === 1 ? 10 : 6}" maxlength="10000" ${state.finishedAt ? "disabled" : ""}>${esc(progress.answers[field.key] || "")}</textarea></label>`,
            )
            .join("")}<button
            class="primary"
            ${state.finishedAt ? "disabled" : ""}
          >
            ${t("save")}
          </button>
        </form>
        ${legacyEntries(progress, lang).length
          ? `<details class="legacy-answers"><summary>${lang === "sv" ? "Tidigare svar — sparade från föregående frågeversion" : "Previous answers — kept from the earlier question version"}</summary>${legacyEntries(
              progress,
              lang,
            )
              .map(
                (entry) =>
                  `<h4>${esc(entry.label)}</h4><p style="white-space: pre-wrap">${esc(entry.value)}</p>`,
              )
              .join("")}</details>`
          : ""}
        <p id="saveStatus" class="save-status">
          ${saveInfo.at ? saveText() : t("local")}
        </p>
        ${backupHTML()}
        <button id="next" class="ghost">
          ${current === 7 ? t("report") : t("continue")}
        </button>
      </section>
    </div>`;
  document.querySelector("#back").onclick = () => {
    view = "map";
    render();
  };
  document.querySelector("#reload").onclick = () => {
    document.querySelector("#player").src =
      "/missions/" +
      String(current).padStart(2, "0") +
      "/index.html?lang=" +
      lang +
      "&reload=" +
      Date.now();
  };
  document.querySelector("#reasoning").oninput = (e) => {
    progress.answers[e.target.name] = e.target.value;
    persist();
  };
  document.querySelector("#reasoning").onsubmit = (e) => {
    e.preventDefault();
    persist();
    toast(t("review"));
  };
  wireBackup();
  document.querySelector("#next").onclick = () => {
    if (current === 7) view = "report";
    else current++;
    persist();
    render();
    // Diskret påminnelse: ingen dialogruta och ingen automatisk nedladdning.
    // Discreet reminder: no dialog and no automatic download.
    toast(
      t("backupReminder") +
        (lastBackupAt
          ? " " +
            t("lastBackup") +
            " " +
            lastBackupAt.toLocaleTimeString(timeFormat(), {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""),
    );
  };
  document.querySelector("#check").onclick = check;
}
// Be uppgiftens inbäddade sida att kontrollera beteendet. / Ask the embedded mission to check behavior.
function check() {
  const frame = document.querySelector("#player"),
    button = document.querySelector("#check"),
    status = document.querySelector("#checkStatus"),
    id = current,
    token = crypto.randomUUID();
  button.disabled = true;
  status.textContent = t("checking");
  const timeout = setTimeout(() => done(null), 1800);
  function done(result) {
    clearTimeout(timeout);
    window.removeEventListener("message", listener);
    if (result) {
      const m = state.missions[id - 1];
      m.passed = result.passed;
      if (m.attempts.length >= 50) m.attempts.shift();
      m.attempts.push({
        at: new Date().toISOString(),
        passed: result.passed,
        detail: result.detail,
        evidence: result.evidence,
      });
      persist();
    }
    if (view === "mission" && current === id) {
      button.disabled = !!state.finishedAt;
      status.textContent = result
        ? result.passed
          ? t("success")
          : t("failed")
        : t("timeout");
      document.querySelector("#missionPoints").innerHTML =
        missionPointsHTML(id);
      document.querySelector("#technical").textContent = result?.passed
        ? "✓ " + t("ready")
        : t("pending");
    }
  }
  function listener(e) {
    if (
      e.origin !== location.origin ||
      e.source !== frame.contentWindow ||
      e.data?.type !== "check-result" ||
      e.data.token !== token
    )
      return;
    done(e.data);
  }
  window.addEventListener("message", listener);
  frame.contentWindow.postMessage({ type: "check", token }, location.origin);
}
// Sammanställ svar och tekniska kontroller för inlämning. / Summarize answers and technical checks.
function report() {
  app.innerHTML = /* HTML */ `<button class="ghost" id="back">
      ${t("back")}
    </button>
    <div class="eyebrow" style="margin-top:28px">
      BACKSTAGE / MISSION REPORT
    </div>
    <h1>${t("reportTitle")}</h1>
    ${pointsHTML()}
    <p class="muted">${t("reportIntro")}</p>
    <p class="muted">
      ${lang === "sv"
        ? "Spara alla ändringar i VS Code först (Ctrl+S eller Cmd+S). Låt servern vara igång. HTML-inlämningen innehåller dina svar och den sparade koden under varje uppgift. Öppna filen och kontrollera att koden finns med innan du lämnar den på lärplattformen."
        : "Save all changes in VS Code first (Ctrl+S or Cmd+S). Keep the server running. The HTML submission includes your answers and saved code under each mission. Open the file and check that the code is included before submitting it on the learning platform."}
    </p>
    <div class="panel">
      <h3>${esc(state.firstName)} ${esc(state.lastName)}</h3>
      <p class="muted">
        ${t("time")}:
        ${Math.floor(
          ((state.finishedAt ? Date.parse(state.finishedAt) : Date.now()) -
            Date.parse(state.startedAt)) /
            60000,
        )}
        min
      </p>
      <p>${t("grading")}</p>
      ${state.missions
        .map(
          (m) =>
            `<div class="summary-row"><strong>${m.id}. ${esc(missions[m.id - 1][lang].title)}</strong><div class="badge">${m.passed ? t("ready") : t("pending")} · ${answer(m) ? t("review") : t("empty")}</div><small>${t("attempts")}: ${m.attempts.length}</small>${missionPointsHTML(m.id)}</div>`,
        )
        .join("")}
      <div class="actions" style="margin-top:24px">
        <button id="html" class="primary">${t("html")}</button
        ><button id="finish" ${state.finishedAt ? "disabled" : ""}>
          ${t("finish")}
        </button>
      </div>
      ${state.finishedAt ? `<p>${t("finished")}</p>` : ""}
      <p class="muted">${t("submitVsBackup")}</p>
      ${backupHTML()}
      <p id="saveStatus" class="save-status">
        ${saveInfo.at ? saveText() : t("local")}
      </p>
    </div>`;
  document.querySelector("#back").onclick = () => {
    view = "map";
    render();
  };
  wireBackup();
  document.querySelector("#html").onclick = downloadSubmission;
  document.querySelector("#finish").onclick = () => {
    state.finishedAt = new Date().toISOString();
    persist();
    render();
  };
}
// Skapa en läsbar rapport och skydda elevtext som HTML-text. / Export escaped student text.
function reportHTML(sources) {
  return `<!doctype html><html lang="${esc(lang)}"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Backstage report</title><style>body{font:16px/1.6 system-ui;max-width:900px;margin:40px auto;padding:20px;color:#172033}section{border-top:1px solid #ccc;margin-top:24px}pre{white-space:pre-wrap;font:inherit}small{color:#555}.source-code{font:13px/1.5 monospace;background:#f1f3f6;padding:16px;overflow-wrap:anywhere}.missing-code{color:#a01919;font-weight:bold}.score-table table{width:100%;border-collapse:collapse}.score-table td,.score-table th{text-align:left;padding:8px;border-bottom:1px solid #ccc}</style><h1>Backstage — ${esc(state.firstName)} ${esc(state.lastName)}</h1><p>${esc(t("grading"))}</p><p>${esc(state.startedAt)} → ${esc(state.finishedAt || "—")} · ${esc(state.id)}</p>${pointsHTML()}${sourceSummaryHTML(sources)}${state.missions
    .map(
      (m) =>
        `<section><h2>${m.id}. ${esc(missions[m.id - 1][lang].title)}</h2><p>${esc(missions[m.id - 1][lang].question)}</p>${missionPointsHTML(m.id)}<p>${esc(m.passed ? t("ready") : t("pending"))} · ${esc(t("attempts"))}: ${m.attempts.length}</p>${answerEntries(
          missions[m.id - 1],
          m,
          lang,
        )
          .map(
            (entry) =>
              `<h3>${esc(entry.label)}</h3><pre>${esc(entry.value || t("empty"))}</pre>`,
          )
          .join("")}${sourceSection(sources, m.id, lang)}</section>`,
    )
    .join("")}</html>`;
}
// Ladda ned en fil lokalt; ingen central inlämning görs. / Download a local file.
function saveFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function download(ext, content, type) {
  saveFile(
    "resultat_" +
      ((state.firstName + "_" + state.lastName)
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .replace(/^_+$/, "") || "elev") +
      "_" +
      state.id.slice(0, 8) +
      "." +
      ext,
    content,
    type,
  );
}
language.onchange = () => {
  lang = language.value;
  persist();
  render();
};
render();
if (restored) toast(t("restored"));

// Ett första obetygsatt uppdrag lär eleven provets arbetsflöde.
// An ungraded warm-up teaches the exam workflow before mission 01.
function tutorial() {
  const swedish = lang === "sv";
  const copy = swedish
    ? {
        title: "Först: testa hur provet fungerar.",
        intro:
          "Det här är en övningsrunda utan poäng. Här får du lösningen och tränar bara på att hitta filen, spara, ladda om och kontrollera.",
        steps: [
          "I VS Code: öppna public → missions → 00 → app.js. Uppdragen fungerar som labbarna: deras filer ligger i varsin mapp, 01 till 07.",
          "I DevTools: öppna Sources och leta efter localhost → missions → 00 → app.js. Uppgiften körs i en inbäddad sida, så du kan behöva expandera den sidans filgrupp. Provets huvudfil heter exam-shell.js.",
          "När Console visar ett fel: klicka på filnamnet vid felet och kontrollera hela sökvägen. Radnumret visar var felet upptäcks, inte alltid var det börjar.",
          "Ändra demoButton.disabled = true till demoButton.disabled = false i VS Code. Spara med Ctrl+S (Mac: Cmd+S).",
          "Klicka Ladda om spelaren här nedanför. Klicka sedan Testa knappen inne i spelaren och till sist Kontrollera övningen.",
          "Skriv något i övningsfältet. Under provet varierar frågorna. Ibland får du ett större fält, ibland två. Svara på frågan som visas och förklara hur du tänker. Du får gå vidare även om koden inte fungerar.",
        ],
        check: "Kontrollera övningen",
        note: "Vad upptäckte du? (övning, bedöms inte)",
        go: "Börja uppdrag 1 →",
        good: "Bra! Nu har du provat hela flödet. Övningen ger inga poäng.",
        retry:
          "Knappen är inte klar ännu. Följ steg 4 och 5, eller gå vidare när du vill.",
        open: "Öppna övningen i egen flik om filgruppen är svår att hitta",
      }
    : {
        title: "First: try out the exam.",
        intro:
          "This is an ungraded warm-up. The solution is provided: just practise finding the file, saving, reloading and checking.",
        steps: [
          "In VS Code: open public → missions → 00 → app.js. Missions work like the labs: their files live in separate folders, 01 to 07.",
          "In DevTools: open Sources and find localhost → missions → 00 → app.js. The mission runs in an embedded page, so you may need to expand that page’s file group. The exam shell is named exam-shell.js.",
          "When Console shows an error: click its filename and check the full path. The line number shows where the problem is detected, not always where it starts.",
          "In VS Code, change demoButton.disabled = true to demoButton.disabled = false. Save with Ctrl+S (Mac: Cmd+S).",
          "Click Reload player below. Then click Try the button inside the player, followed by Check practice.",
          "Write something in the practice field. Exam questions vary: sometimes there is one larger field, sometimes two. Answer the question shown and explain your thinking. You may continue even when your code is unfinished.",
        ],
        check: "Check practice",
        note: "What did you discover? (practice, ungraded)",
        go: "Start mission 1 →",
        good: "Great! You have tried the whole workflow. Practice does not earn points.",
        retry:
          "The button is not ready yet. Follow steps 4 and 5, or continue whenever you like.",
        open: "Open practice in its own tab if its file group is hard to find",
      };

  app.innerHTML = /* HTML */ `
    <button class="ghost" id="practice-back">${t("back")}</button>
    <div class="eyebrow" style="margin-top: 24px">WARM-UP / 00</div>
    <h2>${copy.title}</h2>
    <p class="muted">${copy.intro}</p>
    <div class="workspace">
      <section class="panel">
        <code class="path">public/missions/00/app.js</code>
        <iframe
          id="practice-player"
          title="Warm-up"
          src="/missions/00/index.html?lang=${lang}"
        ></iframe>
        <div class="actions">
          <button id="practice-check" class="primary">${copy.check}</button>
          <button id="practice-reload">${t("reload")}</button>
        </div>
        <p id="practice-status" role="status"></p>
        <p>
          <a
            href="/missions/00/index.html?lang=${lang}"
            target="_blank"
            rel="noopener"
            >${copy.open}</a
          >
        </p>
        <label class="field"
          >${copy.note}<textarea id="practice-answer" maxlength="10000">
${esc(state.practiceAnswer || "")}</textarea
          >
        </label>
        <p id="saveStatus" class="save-status">${t("local")}</p>
      </section>
      <section class="panel">
        <ol>
          ${copy.steps
            .map((step) => `<li style="margin-bottom: 16px">${esc(step)}</li>`)
            .join("")}
        </ol>
        <button id="practice-go" class="primary">${copy.go}</button>
      </section>
    </div>
  `;

  document.querySelector("#practice-back").onclick = () => {
    view = "map";
    render();
  };
  document.querySelector("#practice-go").onclick = () => {
    state.practiceComplete = true;
    persist();
    current = 1;
    view = "mission";
    render();
  };
  document.querySelector("#practice-answer").oninput = (event) => {
    state.practiceAnswer = event.target.value;
    persist();
  };
  document.querySelector("#practice-reload").onclick = () => {
    document.querySelector("#practice-player").src =
      `/missions/00/index.html?lang=${lang}&reload=${Date.now()}`;
    document.querySelector("#practice-status").textContent = "";
  };
  document.querySelector("#practice-check").onclick = () => {
    const frame = document.querySelector("#practice-player");
    const status = document.querySelector("#practice-status");
    const token = crypto.randomUUID();
    const button = document.querySelector("#practice-check");
    button.disabled = true;
    const finish = (message) => {
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      button.disabled = false;
      status.textContent = message;
    };
    const receive = (event) => {
      if (
        event.origin !== location.origin ||
        event.source !== frame.contentWindow
      )
        return;
      if (event.data?.type !== "check-result" || event.data.token !== token)
        return;
      finish(event.data.passed ? copy.good : copy.retry);
    };
    const timer = setTimeout(() => finish(t("timeout")), 1800);
    window.addEventListener("message", receive);
    frame.contentWindow.postMessage({ type: "check", token }, location.origin);
  };
}

// Läs sparade filer utan ZIP eller ett separat export-API. Svaren kan räddas även om servern stannat.
function sourceSummaryHTML(sources) {
  const count = sources.files.filter((f) => f.status === "included").length;
  const sv = lang === "sv";
  return `<section><h2>${sv ? "Kod i inlämningen" : "Code in this submission"}</h2><p>${count}/${sources.files.length} ${sv ? "kodfiler hämtade" : "code files included"} · ${esc(sources.capturedAt)}</p><p>${sv ? "Detta är filerna som var sparade vid nedladdningen. Ändringar som inte sparats i VS Code följer inte med." : "These are the files saved at download time. Unsaved changes in VS Code are not included."}</p>${
    sources.complete
      ? ""
      : `<p class="missing-code">${sv ? "INLÄMNINGEN SAKNAR KODFILER. Lämna filerna nedan separat, eller starta servern och ladda ned inlämningen igen." : "CODE FILES ARE MISSING. Submit the files listed below separately, or start the server and download the submission again."}</p><ul>${sources.files
          .filter((f) => f.status !== "included")
          .map((f) => `<li>${esc(f.path)}</li>`)
          .join("")}</ul>`
  }</section>`;
}

async function downloadSubmission() {
  const buttons = [...document.querySelectorAll("#html")];
  buttons.forEach((button) => (button.disabled = true));
  const status = document.querySelector("#saveStatus");
  status.textContent =
    lang === "sv" ? "Hämtar din sparade kod…" : "Collecting your saved code…";
  try {
    const sources = await collectSourceFiles(missions);
    download("html", reportHTML(sources), "text/html");
    if (sources.complete) {
      status.textContent =
        lang === "sv"
          ? "Inlämningen har skapats med svar och kod. Öppna den nedladdade filen och kontrollera innehållet."
          : "Your submission was created with answers and code. Open the downloaded file and check its contents.";
    } else {
      status.textContent =
        (lang === "sv"
          ? "Svaren finns i rapporten, men följande kodfiler saknas. Starta servern och försök igen, eller lämna filerna separat: "
          : "Your answers are in the report, but these code files are missing. Start the server and try again, or submit these files separately: ") +
        sources.files
          .filter((f) => f.status !== "included")
          .map((f) => f.path)
          .join(", ");
      toast(
        lang === "sv"
          ? "Rapporten saknar kodfiler. Se listan under knapparna."
          : "The report is missing code files. See the list below the buttons.",
      );
    }
  } catch {
    status.textContent =
      lang === "sv"
        ? "Inlämningen kunde inte skapas. Dina sparade svar finns kvar. Ladda om sidan och försök igen."
        : "The submission could not be created. Your saved answers remain. Reload the page and try again.";
  } finally {
    buttons.forEach((button) => (button.disabled = false));
  }
}
