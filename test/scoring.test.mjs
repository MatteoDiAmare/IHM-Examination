import test from "node:test";
import assert from "node:assert/strict";
import { scoringRules, scoreSummary } from "../public/scoring.js";

test("points totals match thresholds; saved prose never earns automatic marks", () => {
  assert.equal(
    scoringRules.missions.reduce(
      (n, m) => n + m.code + m.reasoning + m.depth,
      0,
    ),
    24,
  );
  assert.equal(
    scoringRules.missions
      .slice(0, 6)
      .reduce((n, m) => n + m.code + m.reasoning, 0),
    18,
  );
  const saved = scoringRules.missions.map((m) => ({
    id: m.id,
    passed: false,
    answers: { reasoning: "Long answer", vgEvidence: "Claimed VG" },
  }));
  assert.equal(scoreSummary(saved).automaticPoints, 0);
  const all = scoreSummary(saved.map((m) => ({ ...m, passed: true })));
  assert.equal(all.automaticPoints, 10);
  assert.equal(all.missions[6].automaticPoints, 1);
  assert.equal(all.missions[6].reviewedCodePoints, null);
  assert.equal(all.finalGrade, null);
  assert.equal(all.totalPoints, null);
  assert.equal(all.learningOutcomesMet, null);
});
