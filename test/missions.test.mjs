import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
const bridge = await readFile(
  new URL("../public/bridge.js", import.meta.url),
  "utf8",
);
const missions = JSON.parse(
  await readFile(new URL("../public/missions.json", import.meta.url), "utf8"),
);
test("every mission has equivalent SV/EN fields and a real editable file", async () => {
  assert.equal(missions.length, 7);
  for (const m of missions) {
    assert.deepEqual(Object.keys(m.sv), Object.keys(m.en));
    for (const lang of ["sv", "en"])
      for (const value of Object.values(m[lang])) assert.ok(value.length > 0);
    assert.ok(
      (await readFile(new URL("../" + m.file, import.meta.url), "utf8"))
        .length > 0,
    );
  }
});
test("isolated bridge reports failed and successful outcomes without relying on broken script", async () => {
  for (let id = 1; id <= 7; id++) {
    const handlers = {},
      messages = [],
      elements = {};
    let visible = false;
    const element = (name) =>
      (elements[name] ??= {
        dataset: {},
        style: {},
        textContent: "",
        value: "night-drive",
        getBoundingClientRect: () => ({ height: 30 }),
        click() {
          if (visible) elements["#status"].dataset.playing = "true";
        },
      });
    let stored = null;
    const parent = { postMessage: (m) => messages.push(m) },
      location = {
        pathname: "/missions/" + String(id).padStart(2, "0") + "/index.html",
        origin: "http://localhost",
        search: "?lang=en",
      };
    const context = {
      window: {
        addEventListener: (type, fn) => (handlers[type] = fn),
        fetch: async (url) => ({
          status: url === "/api/events" ? 202 : 200,
          clone() {
            return { json: async () => ({ accepted: true }) };
          },
        }),
      },
      parent,
      location,
      URLSearchParams,
      document: {
        documentElement: {},
        querySelector: element,
        querySelectorAll: (selector) =>
          selector === "#tracks li" ? (visible ? [{}, {}] : []) : [],
      },
      getComputedStyle: () => ({
        display: visible ? "block" : "none",
        visibility: "visible",
      }),
      localStorage: { getItem: () => stored },
      console,
    };
    vm.createContext(context);
    vm.runInContext(bridge, context);
    const event = {
      origin: location.origin,
      source: parent,
      data: { type: "check", token: "test" },
    };
    // Initial broken state; events and rendered data must not pass automatically.
    await handlers.message(event);
    assert.equal(messages.at(-1).passed, false, "initial mission " + id);
    visible = true;
    stored = "night-drive";
    element("#status").dataset.ready = "true";
    element("#encore").textContent = "Encore: Moonrise";
    await context.window.fetch("/api/tracks");
    await context.window.fetch("/api/events", { method: "POST" });
    await context.window.fetch("/api/encore");
    await handlers.message(event);
    assert.equal(messages.at(-1).passed, true, "fixed mission " + id);
    const count = messages.length;
    await handlers.message({ ...event, origin: "https://other.test" });
    assert.equal(messages.length, count);
  }
});

test("translation does not overwrite a repaired ready light", () => {
  const handlers = {};
  const status = {
    id: "status",
    dataset: {
      ready: "true",
      sv: "Startlampan är släckt",
      en: "Ready light is off",
    },
    textContent: "● Startlampan är tänd",
  };
  const button = {
    id: "button",
    dataset: { sv: "Spela", en: "Play" },
    textContent: "",
  };
  const context = {
    window: {
      addEventListener: (name, handler) => (handlers[name] = handler),
      fetch: async () => {},
    },
    document: { documentElement: {}, querySelectorAll: () => [status, button] },
    location: { pathname: "/missions/01/index.html", search: "?lang=sv" },
    URLSearchParams,
  };
  vm.createContext(context);
  vm.runInContext(bridge, context);
  handlers.DOMContentLoaded();
  assert.equal(status.textContent, "● Startlampan är tänd");
  assert.equal(button.textContent, "Spela");
});
