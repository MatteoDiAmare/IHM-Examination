// Webbläsartest mot en tillfällig kopia av repot (originalfilerna ändras aldrig).
// Browser test against a temporary copy of the repo (the original files are never modified).
// Kör / Run:  PLAYWRIGHT_PATH=/sökväg/till/playwright node e2e/exam.e2e.mjs
// Playwright är inget beroende i projektet; installera det själv vid behov.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(
  process.env.PLAYWRIGHT_PATH
    ? process.env.PLAYWRIGHT_PATH + "/"
    : import.meta.url,
);
const { chromium } = require("playwright");
const long = "Svar med åäö — och längre text. ".repeat(280);
let passed = 0;
const ok = (name) => console.log("PASS", ++passed, name);

async function copyRepo() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "backstage-e2e-"));
  await cp(repo, dir, {
    recursive: true,
    filter: (src) => !/[\\/](\.git|node_modules|data|e2e)$/.test(src),
  });
  return dir;
}
const edit = async (dir, file, from, to) => {
  const target = path.join(dir, file);
  const text = await readFile(target, "utf8");
  assert.ok(text.includes(from), file + " saknar " + from);
  await writeFile(target, text.replace(from, to));
};
async function solve(dir) {
  const m = "public/missions/";
  await edit(
    dir,
    m + "01/app.js",
    "  status.dataset.ready = 'true';\n",
    "  status.dataset.ready = 'true';\n}\n",
  );
  await edit(dir, m + "02/index.html", ' style="display: none"', "");
  await edit(dir, m + "03/app.js", '"hover"', '"click"');
  await edit(dir, m + "04/app.js", "trakcs", "tracks");
  await edit(
    dir,
    m + "05/app.js",
    "  // TODO: Spara select.value här / Save select.value here.\n",
    "  localStorage.setItem(key, select.value);\n",
  );
  await edit(
    dir,
    m + "06/app.js",
    "const visitorId = null;",
    'const visitorId = "v-1";',
  );
  await edit(
    dir,
    m + "07/app.js",
    'const track = { title: "TODO" };',
    "const r = await fetch('/api/encore'); if (!r.ok) throw new Error('HTTP ' + r.status); const track = await r.json();",
  );
}
function startServer(dir, port) {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: dir,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  return new Promise((resolve) => setTimeout(() => resolve(child), 800));
}
const stop = (child) =>
  new Promise((resolve) => {
    child.once("exit", resolve);
    child.kill();
  });

async function newPage(browser, base, dialogs, answer = true) {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  page.on("dialog", (d) => {
    dialogs.push(d.message());
    answer ? d.accept() : d.dismiss();
  });
  await page.goto(base);
  return { context, page };
}
const start = async (page, first, last) => {
  await page.fill("input[name=first]", first);
  await page.fill("input[name=last]", last);
  await page.click("form#start button");
  await page.click("#practice-go");
};
const settled = (page) =>
  page.waitForFunction(() =>
    /Sparat i webbläsaren och på/.test(
      document.querySelector("#saveStatus")?.textContent || "",
    ),
  );
const check = async (page) => {
  await page.click("#check");
  await page.waitForFunction(() => !document.querySelector("#check").disabled);
  return (await page.textContent("#checkStatus")).trim();
};
const answers = (page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("backstage-exam-v1")).missions.map(
      (m) => m.answers,
    ),
  );

async function checkAllMissions(browser, base, solved) {
  const dialogs = [];
  const { context, page } = await newPage(browser, base, dialogs);
  await start(page, "A", "B");
  for (let id = 1; id <= 7; id++) {
    const f = page.frameLocator("#player");
    if (solved) {
      if (id === 3) await f.locator("#play").click();
      if (id === 4) await f.locator("#load").click();
      if (id === 5) {
        await f.locator("#favourite").selectOption("first-light");
        await f.locator("#save").click();
      }
      if (id === 6) await f.locator("#send").click();
      if (id === 7) await f.locator("#load").click();
      await page.waitForTimeout(300);
    }
    const result = await check(page);
    assert.equal(
      result.startsWith("Snyggt"),
      solved,
      `uppdrag ${id} ${solved ? "löst" : "olöst"}: ${result}`,
    );
    if (id < 7) await page.click("#next");
  }
  await context.close();
  ok(`alla sju uppdrag ${solved ? "med referenslösning" : "olösta"}`);
}

const browser = await chromium.launch();
const base = (port) => "http://127.0.0.1:" + port;
const dirA = await copyRepo();
const dirB = await copyRepo();
await solve(dirB);
let serverA = await startServer(dirA, 3201);
const serverB = await startServer(dirB, 3202);
try {
  await checkAllMissions(browser, base(3202), true);
  await checkAllMissions(browser, base(3201), false);

  const url = base(3201);
  const dialogs = [];
  const { context, page } = await newPage(browser, url, dialogs);
  await start(page, "Åsa", "Öberg");
  await check(page); // uppdrag 1 olöst -> ett kontrollförsök sparas
  await page.fill("textarea", long);
  await settled(page);
  await page.click("#next");
  assert.match(await page.textContent("#notice"), /säkerhetskopia/);
  assert.equal(dialogs.length, 0);
  ok("påminnelse om säkerhetskopia visas som toast, utan dialogruta");
  await settled(page).catch(() => {});
  const sessionId = await page.evaluate(
    () => JSON.parse(localStorage.getItem("backstage-exam-v1")).id,
  );
  const savedAnswers = await answers(page);
  assert.equal(savedAnswers[0].reasoning, long);

  // 1. localStorage rensat, sessionStorage kvar
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#reasoning");
  assert.deepEqual(await answers(page), savedAnswers);
  ok("återställning efter rensat localStorage");

  // 2. misslyckad återställning, sedan lyckat nytt försök; ID får inte raderas
  await page.evaluate(() => localStorage.clear());
  let blocked = true;
  await page.route("**/api/sessions/*", (route) =>
    blocked && route.request().method() === "GET"
      ? route.abort()
      : route.continue(),
  );
  await page.reload();
  await page.waitForSelector("#retryRestore");
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("backstage-navigation-v1")).sessionId,
    ),
    sessionId,
  );
  await page.click("#retryRestore");
  await page.waitForFunction(() =>
    /kunde inte hämtas/.test(
      document.querySelector("#retryStatus")?.textContent || "",
    ),
  );
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("backstage-navigation-v1")).sessionId,
    ),
    sessionId,
  );
  blocked = false;
  await page.click("#retryRestore");
  await page.waitForSelector("#reasoning");
  assert.deepEqual(await answers(page), savedAnswers);
  ok("misslyckad återställning behåller ID och nästa försök lyckas");

  // 2b. långsam server (timeout) behandlas som tillfälligt fel
  await page.unroute("**/api/sessions/*");
  await page.evaluate(() => localStorage.clear());
  await page.route("**/api/sessions/*", (route) =>
    route.request().method() === "GET"
      ? new Promise(() => {})
      : route.continue(),
  );
  await page.reload();
  await page.waitForSelector("#retryRestore", { timeout: 8000 });
  await page.unroute("**/api/sessions/*");
  await page.click("#retryRestore");
  await page.waitForSelector("#reasoning");
  ok(
    "timeout vid återställning ger knappen 'Försök återställa igen' och ID behålls",
  );

  // 3. stängd flik + rensade lagringar + serveromstart -> lista
  await page.close();
  await context.clearCookies();
  await stop(serverA);
  serverA = await startServer(dirA, 3201);
  const fresh = await newPage(browser, url, dialogs);
  assert.equal(await fresh.page.locator("#retryRestore").count(), 0);
  await fresh.page.click("#restorePrev");
  await fresh.page.waitForSelector(".restore-items li");
  const row = await fresh.page.textContent(".restore-items li");
  assert.match(row, /Åsa Öberg/);
  assert.match(row, /Senast sparad: \d/);
  await fresh.page.click("[data-restore]");
  await fresh.page.waitForSelector("#reasoning, .cards, #practice-go");
  const stored = await fresh.page.evaluate(() =>
    JSON.parse(localStorage.getItem("backstage-exam-v1")),
  );
  assert.equal(stored.firstName, "Åsa");
  assert.equal(stored.missions[0].answers.reasoning, long);
  assert.equal(stored.missions[0].attempts.length, 1);
  assert.equal(stored.practiceComplete, true);
  assert.equal(
    dialogs.length,
    0,
    "ingen bekräftelse behövs utan befintliga svar",
  );
  ok(
    "återställ tidigare prov efter stängd flik, rensade lagringar och omstart av servern (namn, svar, kontrollresultat, progression)",
  );

  // 4. säkerhetskopia med servern nere
  await fresh.page.route("**/api/**", (route) => route.abort());
  await fresh.page.waitForSelector("#backup");
  const [download] = await Promise.all([
    fresh.page.waitForEvent("download"),
    fresh.page.click("#backup"),
  ]);
  assert.match(
    download.suggestedFilename(),
    /^sakerhetskopia_Asa_Oberg_\d{4}-\d\d-\d\d_\d\d-\d\d\.json$/,
  );
  const backupPath = path.join(dirA, "min-kopia.json");
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assert.equal(backup.session.missions[0].answers.reasoning, long);
  assert.equal(backup.session.id, sessionId);
  assert.match(await fresh.page.textContent("#backupStatus"), /startades/);
  assert.doesNotMatch(await fresh.page.textContent("#backupStatus"), /sparad/i);
  ok("säkerhetskopia (åäö, långt svar) fungerar när servern inte svarar");
  await fresh.page.unroute("**/api/**");

  // 5. serverstatus och webbläsarstatus redovisas var för sig
  await fresh.page.route("**/api/sessions/*", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await fresh.page.fill("textarea", long + " mer");
  await fresh.page.waitForFunction(() =>
    /Serverkopian kunde inte sparas/.test(
      document.querySelector("#saveStatus")?.textContent || "",
    ),
  );
  ok(
    "sparstatus skiljer webbläsare från server (ingen falsk 'sparat på servern')",
  );
  await fresh.page.unroute("**/api/sessions/*");
  await fresh.page.fill("textarea", long);
  await settled(fresh.page);

  // 6. felaktig import ändrar inget
  const before = await answers(fresh.page);
  const badFiles = {
    "inte-json.json": "{trasig",
    "fel-format.json": JSON.stringify({ format: "annat", session: {} }),
    "fel-innehall.json": JSON.stringify({
      format: "backstage-backup",
      formatVersion: 1,
      session: { ...backup.session, missions: [] },
    }),
    "fel-id.json": JSON.stringify({ ...backup.session, id: "../../x" }),
  };
  for (const [name, content] of Object.entries(badFiles)) {
    const file = path.join(dirA, name);
    await writeFile(file, content);
    const [chooser] = await Promise.all([
      fresh.page.waitForEvent("filechooser"),
      fresh.page.click("#importBackup"),
    ]);
    await chooser.setFiles(file);
    await fresh.page.waitForFunction(() =>
      /oförändrade/.test(
        document.querySelector("#backupStatus")?.textContent || "",
      ),
    );
    await fresh.page.evaluate(
      () => (document.querySelector("#backupStatus").textContent = ""),
    );
  }
  assert.deepEqual(await answers(fresh.page), before);
  assert.equal(dialogs.length, 0);
  ok(
    "felaktig import (4 varianter) raderar inga svar och ger ingen bekräftelserad",
  );

  // 7. avböjd bekräftelse ändrar inget; sedan godkänd import i tom webbläsare
  await fresh.page.fill("textarea", "ett nyare svar");
  await settled(fresh.page);
  const newer = await answers(fresh.page);
  const dialogs2 = [];
  fresh.page.removeAllListeners("dialog");
  fresh.page.on("dialog", (d) => {
    dialogs2.push(d.message());
    d.dismiss();
  });
  let [chooser] = await Promise.all([
    fresh.page.waitForEvent("filechooser"),
    fresh.page.click("#importBackup"),
  ]);
  await chooser.setFiles(backupPath);
  await fresh.page.waitForTimeout(500);
  assert.equal(dialogs2.length, 1);
  assert.match(dialogs2[0], /Åsa Öberg/);
  assert.match(dialogs2[0], /ersätts/);
  assert.deepEqual(await answers(fresh.page), newer);
  ok("import kräver bekräftelse med namn och tid; nej ändrar inget");
  await fresh.context.close();

  const third = await newPage(browser, url, dialogs);
  [chooser] = await Promise.all([
    third.page.waitForEvent("filechooser"),
    third.page.click("#restoreBackup"),
  ]);
  await chooser.setFiles(backupPath);
  await third.page.waitForSelector("#reasoning");
  assert.equal((await answers(third.page))[0].reasoning, long);
  await settled(third.page);
  const serverCopy = await (
    await fetch(url + "/api/sessions/" + sessionId)
  ).json();
  assert.equal(serverCopy.missions[0].answers.reasoning, long);
  assert.equal(serverCopy.missions[0].attempts.length, 1);
  ok(
    "import i tom webbläsare återställer och sparar i webbläsare och på server (åäö, långt svar)",
  );

  // 8. HTML-inlämning med svar och kod; ingen JSON-knapp kvar
  await third.page.click("#next", { timeout: 1000 }).catch(() => {});
  for (let i = 0; i < 7; i++)
    if (await third.page.locator("#next").count())
      await third.page.click("#next");
  await third.page.waitForSelector("#html");
  assert.equal(await third.page.locator("#json").count(), 0);
  assert.equal(await third.page.locator("#backup").count(), 1);
  const [submission] = await Promise.all([
    third.page.waitForEvent("download"),
    third.page.click("#html"),
  ]);
  assert.match(submission.suggestedFilename(), /\.html$/);
  const html = await readFile(await submission.path(), "utf8");
  assert.ok(html.includes("Svar med åäö"));
  assert.ok(html.includes("function boot"));
  assert.ok(html.includes("public/missions/02/index.html"));
  ok(
    "HTML-inlämning med svar och sparade kodfiler; JSON-knappen är ersatt av säkerhetskopia",
  );
  await third.context.close();

  // 9. nytt prov rensar ID: ingen återställningsruta efter avsiktlig nollställning
  const reset = await newPage(browser, url, dialogs);
  await start(reset.page, "Nils", "Ek");
  await reset.page.evaluate(() => sessionStorage.clear());
  await reset.page.reload();
  await reset.page.click("#new");
  assert.equal(
    await reset.page.evaluate(() =>
      sessionStorage.getItem("backstage-navigation-v1"),
    ),
    null,
  );
  await reset.page.reload();
  assert.equal(await reset.page.locator("#retryRestore").count(), 0);
  assert.equal(await reset.page.locator("form#start").count(), 1);
  ok("'Starta ett nytt test' nollställer sessions-ID i fliken");
  await reset.context.close();
} finally {
  await browser.close();
  await stop(serverA);
  await stop(serverB);
  await rm(dirA, { recursive: true, force: true });
  await rm(dirB, { recursive: true, force: true });
}
console.log(`\nAlla ${passed} e2e-steg gick igenom.`);
