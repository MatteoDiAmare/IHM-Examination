import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  backupFilename,
  createBackup,
  parseBackup,
  validateSession,
} from "../public/backup.js";
const missions = JSON.parse(
  await readFile(new URL("../public/missions.json", import.meta.url), "utf8"),
);
const ids = missions.map((m) => m.id);
const session = (extra = {}) => ({
  version: "0.1.0",
  id: "11111111-2222-3333-4444-555555555555",
  firstName: "Åsa",
  lastName: "Öberg",
  language: "sv",
  startedAt: "2026-10-07T08:00:00.000Z",
  updatedAt: "2026-10-07T09:30:00.000Z",
  finishedAt: null,
  practiceComplete: true,
  practiceAnswer: "övning åäö",
  position: { view: "mission", current: 4 },
  missions: ids.map((id) => ({
    id,
    answers: { reasoning: "Svar med åäö — och längre text. ".repeat(300) },
    attempts: [
      { at: "2026-10-07T09:00:00.000Z", passed: id < 3, evidence: {} },
    ],
    passed: id < 3,
  })),
  ...extra,
});

test("backup round-trips names, åäö, long answers, attempts and progress", () => {
  const original = session();
  const parsed = parseBackup(createBackup(original), ids);
  assert.equal(parsed.error, undefined);
  assert.deepEqual(parsed.session, original);
  assert.ok(parsed.exportedAt);
});

test("older whole-session JSON exports are accepted", () => {
  const parsed = parseBackup(
    JSON.stringify({ ...session(), scoring: {} }),
    ids,
  );
  assert.equal(parsed.session.firstName, "Åsa");
});

test("invalid backups are rejected without producing a session", () => {
  const cases = {
    empty: "",
    "not-json": "{oops",
    "not-an-object": "[]",
    format: JSON.stringify({ format: "other", session: session() }),
    "format-version": JSON.stringify({
      format: "backstage-backup",
      formatVersion: 99,
      session: session(),
    }),
    version: JSON.stringify({ ...session(), version: "9.9.9" }),
    id: JSON.stringify({ ...session(), id: "../etc/passwd" }),
    name: JSON.stringify({ ...session(), firstName: "  " }),
    missions: JSON.stringify({ ...session(), missions: [] }),
  };
  for (const [expected, text] of Object.entries(cases)) {
    const result = parseBackup(text, ids);
    assert.equal(result.error, expected, expected);
    assert.equal(result.session, undefined);
  }
  const wrongOrder = session();
  wrongOrder.missions.reverse();
  assert.ok(validateSession(wrongOrder, ids).error);
  const badAnswer = session();
  badAnswer.missions[0].answers.reasoning = 42;
  assert.ok(validateSession(badAnswer, ids).error);
  const badPassed = session();
  badPassed.missions[2].passed = "yes";
  assert.ok(validateSession(badPassed, ids).error);
});

test("unknown fields are dropped and the filename carries date and time", () => {
  const { session: clean } = validateSession(
    { ...session(), __proto__: { x: 1 }, evil: "<img onerror=1>" },
    ids,
  );
  assert.equal(clean.evil, undefined);
  const name = backupFilename(session(), new Date(2026, 9, 7, 8, 5));
  assert.equal(name, "sakerhetskopia_Asa_Oberg_2026-10-07_08-05.json");
  assert.match(
    backupFilename(
      { firstName: "محمد", lastName: "علي" },
      new Date(2026, 0, 2, 3, 4),
    ),
    /^sakerhetskopia_elev_2026-01-02_03-04\.json$/,
  );
});
