import { answerEntries, legacyEntries } from "./answers.js";
import { restoreNavigation, saveNavigation } from "./navigation.js";
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
      "Här finns det du har löst och det du har förklarat. Ladda ned rapporten och lämna den tillsammans med dina kodfiler på lärplattformen.",
    json: "Ladda ned JSON",
    html: "Ladda ned läsbar rapport",
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
      "Starta ett nytt test? Exportera först om du vill behålla den här omgången.",
    empty: "Inget svar ännu",
    attempts: "Kontrollförsök",
    continue: "Nästa uppdrag →",
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
      "Here is what you fixed and what you explained. Download the report and submit it with your code files on the learning platform.",
    json: "Download JSON",
    html: "Download readable report",
    finish: "Finish and save",
    finished: "The exam is finished. You can still download the report.",
    grading:
      "Technical checks show which functions work. Your teacher assesses your explanations and determines your G or VG grade.",
    provisional:
      "All six technical G missions are complete! Reasoning still needs teacher assessment.",
    vg: "Encore is optional. The check tests fetching and rendering; error handling and VG need teacher assessment.",
    time: "Elapsed time",
    new: "Start a new test",
    reset: "Start a new test? Export first if you want to keep this attempt.",
    empty: "No answer yet",
    attempts: "Check attempts",
    continue: "Next mission →",
  },
};
const missions = await fetch("/missions.json").then((r) => r.json());
const key = "backstage-exam-v1";
let state;
try {
  state = JSON.parse(localStorage.getItem(key));
} catch {}
if (state?.version !== "0.1.0" || !Array.isArray(state.missions)) state = null;
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
// Spara provsvar i webbläsaren och köa en lokal serverkopia. / Persist answers and queue a server backup.
function persist() {
  if (!state) return;
  state.language = lang;
  state.updatedAt = new Date().toISOString();
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
        const label = document.querySelector("#saveStatus");
        if (label) label.textContent = saved ? t("saved") : t("fallback");
        if (!browserSaved && !saved)
          toast(
            lang === "sv"
              ? "Kunde inte spara. Ladda ned rapporten nu."
              : "Unable to save. Download your report now.",
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
        <p>${t("note")}</p>
        ${state ? `<p>${esc(state.firstName)} ${esc(state.lastName)}</p><button class="primary" id="resume">${t("resume")}</button><button class="ghost" id="new">${t("new")}</button>` : `<form id="start"><div class="name-row"><label class="field">${t("first")}<input name="first" required maxlength="80" autocomplete="given-name"></label><label class="field">${t("last")}<input name="last" required maxlength="80" autocomplete="family-name"></label></div><button class="primary">${t("start")}</button></form>`}
        <p class="save-status">${t("local")}</p>
      </div>
    </div>
    <div class="panel studio">
      <div class="studio-title">
        <span>BACKSTAGE SESSIONS</span><span>VOL. 01</span>
      </div>
      <div class="record"></div>
      <div class="wave">
        ${[12, 22, 38, 48, 28, 18, 40, 50, 32, 20, 35, 46, 25, 12].map((h) => `<i style="height:${h}px"></i>`).join("")}
      </div>
      <p class="muted">
        ${lang === "sv" ? "Från trasig plattform till premiär." : "From broken platform to opening night."}
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
}
function reset() {
  if (!confirm(t("reset"))) return;
  state = null;
  localStorage.removeItem(key);
  view = "welcome";
  render();
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
      <small>${t("grading")}</small
      >${count === 6 ? `<p class="badge">${t("provisional")}</p>` : ""}
    </div>
    <div class="cards">
      ${missions
        .map((m) => {
          const progress = state.missions[m.id - 1];
          return `<button class="mission-card" data-mission="${m.id}"><span class="number">${m.id === 7 ? "ENCORE / VG" : "MISSION / 0" + m.id}</span><h3>${esc(m[lang].title)}</h3><p class="muted">${esc(m[lang].topic)}</p><span class="badge">${progress.passed ? "✓ " + t("ready") : answer(progress) ? "✎ " + t("review") : "↗ " + t("pending")}</span></button>`;
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
    <div class="workspace">
      <section class="panel">
        <p>${esc(m[lang].intro)}</p>
        <small class="muted">${t("file")}</small
        ><code class="path">${m.file}</code>
        <p class="save-status">
          ${lang === "sv" ? "I DevTools: Sources → localhost → missions → " + String(current).padStart(2, "0") + ". Klicka på filnamnet i Console och kontrollera hela sökvägen." : "In DevTools: Sources → localhost → missions → " + String(current).padStart(2, "0") + ". Click the filename in Console and check its full path."}
        </p>
        <iframe
          id="player"
          title="${esc(m[lang].title)}"
          src="/missions/${String(current).padStart(2, "0")}/index.html?lang=${lang}"
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
        ${current === 7 ? `<p class="save-status">${t("vg")}</p>` : ""}
      </section>
      <section class="panel">
        <h3>${t("reflect")}</h3>
        <p class="muted">
          ${lang === "sv" ? "Skriv med egna ord. Du kan resonera även om du inte fått koden att fungera." : "Use your own words. You can explain your reasoning even if your code is unfinished."}
        </p>
        <form id="reasoning">
          ${m[lang].fields.map((field) => `<label class="field">${esc(field.label)}<textarea name="${field.key}" rows="${m[lang].fields.length === 1 ? 10 : 6}" maxlength="10000" ${state.finishedAt ? "disabled" : ""}>${esc(progress.answers[field.key] || "")}</textarea></label>`).join("")}<button
            class="primary"
            ${state.finishedAt ? "disabled" : ""}
          >
            ${t("save")}
          </button>
        </form>
        ${
          legacyEntries(progress, lang).length
            ? `<details class="legacy-answers"><summary>${lang === "sv" ? "Tidigare svar — sparade från föregående frågeversion" : "Previous answers — kept from the earlier question version"}</summary>${legacyEntries(
                progress,
                lang,
              )
                .map(
                  (entry) =>
                    `<h4>${esc(entry.label)}</h4><p style="white-space: pre-wrap">${esc(entry.value)}</p>`,
                )
                .join("")}</details>`
            : ""
        }
        <p id="saveStatus" class="save-status">${t("local")}</p>
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
  document.querySelector("#next").onclick = () => {
    if (current === 7) view = "report";
    else current++;
    render();
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
    <p class="muted">${t("reportIntro")}</p>
    <p class="muted">
      ${lang === "sv" ? "Spara alla ändringar i VS Code först. ZIP-paketet innehåller din rapport och den sparade koden, redo att lämnas på lärplattformen." : "Save all changes in VS Code first. The ZIP package contains your report and saved code, ready to submit on the learning platform."}
    </p>
    <div class="panel">
      <h3>${esc(state.firstName)} ${esc(state.lastName)}</h3>
      <p class="muted">
        ${t("time")}:
        ${Math.floor(((state.finishedAt ? Date.parse(state.finishedAt) : Date.now()) - Date.parse(state.startedAt)) / 60000)}
        min
      </p>
      <p>${t("grading")}</p>
      ${state.missions.map((m) => `<div class="summary-row"><strong>${m.id}. ${esc(missions[m.id - 1][lang].title)}</strong><div class="badge">${m.passed ? t("ready") : t("pending")} · ${answer(m) ? t("review") : t("empty")}</div><small>${t("attempts")}: ${m.attempts.length}</small></div>`).join("")}
      <div class="actions" style="margin-top:24px">
        <button id="zip" class="primary">
          ${lang === "sv" ? "Ladda ned inlämningspaket (ZIP)" : "Download submission package (ZIP)"}
        </button>
        <button id="json">${t("json")}</button
        ><button id="html">${t("html")}</button
        ><button id="finish" ${state.finishedAt ? "disabled" : ""}>
          ${t("finish")}
        </button>
      </div>
      ${state.finishedAt ? `<p>${t("finished")}</p>` : ""}
      <p id="saveStatus" class="save-status">${t("local")}</p>
    </div>`;
  document.querySelector("#back").onclick = () => {
    view = "map";
    render();
  };
  document.querySelector("#json").onclick = () =>
    download(
      "json",
      JSON.stringify(
        {
          ...state,
          exportedAt: new Date().toISOString(),
          assessment: "Teacher review required",
          questionVersion: "2026-10-02",
          questions: missions.map((m) => ({
            id: m.id,
            fields: m[lang].fields,
          })),
        },
        null,
        2,
      ),
      "application/json",
    );
  document.querySelector("#zip").onclick = downloadPackage;
  document.querySelector("#html").onclick = () =>
    download("html", reportHTML(), "text/html");
  document.querySelector("#finish").onclick = () => {
    state.finishedAt = new Date().toISOString();
    persist();
    render();
  };
}
// Skapa en läsbar rapport och skydda elevtext som HTML-text. / Export escaped student text.
function reportHTML() {
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>Backstage report</title><style>body{font:16px/1.6 system-ui;max-width:900px;margin:40px auto;padding:20px;color:#172033}section{border-top:1px solid #ccc;margin-top:24px}pre{white-space:pre-wrap;font:inherit}small{color:#555}</style><h1>Backstage — ${esc(state.firstName)} ${esc(state.lastName)}</h1><p>${esc(t("grading"))}</p><p>${esc(state.startedAt)} → ${esc(state.finishedAt || "—")} · ${state.id}</p>${state.missions
    .map(
      (m) =>
        `<section><h2>${m.id}. ${esc(missions[m.id - 1][lang].title)}</h2><p>${esc(missions[m.id - 1][lang].question)}</p><p>${esc(m.passed ? t("ready") : t("pending"))} · ${esc(t("attempts"))}: ${m.attempts.length}</p>${answerEntries(
          missions[m.id - 1],
          m,
          lang,
        )
          .map(
            (entry) =>
              `<h3>${esc(entry.label)}</h3><pre>${esc(entry.value || t("empty"))}</pre>`,
          )
          .join("")}</section>`,
    )
    .join("")}</html>`;
}
// Ladda ned en fil lokalt; ingen central inlämning görs. / Download a local file.
function download(ext, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    link = document.createElement("a");
  link.href = url;
  link.download =
    "resultat_" +
    (state.firstName + "_" + state.lastName)
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]/g, "") +
    "_" +
    state.id.slice(0, 8) +
    "." +
    ext;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
language.onchange = () => {
  lang = language.value;
  persist();
  render();
};
render();

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
${esc(state.practiceAnswer || "")}</textarea>
        </label>
        <p id="saveStatus" class="save-status">${t("local")}</p>
      </section>
      <section class="panel">
        <ol>
          ${copy.steps.map((step) => `<li style="margin-bottom: 16px">${esc(step)}</li>`).join("")}
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

// Servern läser de sparade kodfilerna, så spara i VS Code före export.
async function downloadPackage() {
  const button = document.querySelector("#zip");
  button.disabled = true;
  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report: {
          ...state,
          exportedAt: new Date().toISOString(),
          questionVersion: "2026-10-02",
          questions: missions.map((m) => ({
            id: m.id,
            fields: m[lang].fields,
          })),
        },
        html: reportHTML(),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    const name = (state.firstName + "_" + state.lastName)
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    link.download = "inlamning_" + name + "_" + state.id.slice(0, 8) + ".zip";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    toast(
      lang === "sv"
        ? "Paketet kunde inte skapas. Kontrollera att servern körs. Du kan fortfarande ladda ned rapporten separat."
        : "Could not create the package. Check that the server is running. You can still download the report separately.",
    );
  } finally {
    button.disabled = false;
  }
}
