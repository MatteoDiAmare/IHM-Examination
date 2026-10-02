import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { answerEntries, legacyEntries } from "../public/answers.js";
const missions = JSON.parse(
  await readFile(new URL("../public/missions.json", import.meta.url), "utf8"),
);

test("SV/EN fields have matching keys and preserve legacy answers in reports", () => {
  for (const mission of missions) {
    assert.deepEqual(
      mission.sv.fields.map((f) => f.key),
      mission.en.fields.map((f) => f.key),
    );
  }
  const progress = {
    answers: {
      observation: "Original observation",
      cause: "Original cause",
      solution: "Original fix",
      reasoning: "New reasoning",
    },
  };
  const entries = answerEntries(missions[0], progress, "sv");
  assert.equal(entries[0].value, "New reasoning");
  assert.deepEqual(
    entries.slice(1).map((e) => e.value),
    ["Original observation", "Original cause", "Original fix"],
  );
  assert.equal(legacyEntries({ answers: {} }, "en").length, 0);
  assert.equal(progress.answers.observation, "Original observation");
});
