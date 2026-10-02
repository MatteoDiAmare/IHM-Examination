// Poängmodellen: kontroller ger funktionspoäng, läraren bedömer resonemang och fördjupning.
export const scoringRules = {
  version: "2026-10-02",
  maximum: 24,
  g: { minimum: 12, poolMaximum: 18, missionIds: [1, 2, 3, 4, 5, 6] },
  vg: { minimum: 20, depthRequired: 2 },
  missions: [
    { id: 1, code: 1, reasoning: 1, depth: 0, automaticCode: 1 },
    { id: 2, code: 1, reasoning: 1, depth: 0, automaticCode: 1 },
    { id: 3, code: 1, reasoning: 1, depth: 0, automaticCode: 1 },
    { id: 4, code: 1, reasoning: 1, depth: 0, automaticCode: 1 },
    { id: 5, code: 2, reasoning: 2, depth: 0, automaticCode: 2 },
    { id: 6, code: 3, reasoning: 3, depth: 0, automaticCode: 3 },
    { id: 7, code: 2, reasoning: 2, depth: 2, automaticCode: 1 },
  ],
  requiredEvidence: {
    allFiveLearningOutcomes: true,
    basicHtmlChange: true,
    basicIdentificationOrTrackingChange: true,
  },
};

// Sparad text är underlag, aldrig ett automatiskt bevis på förståelse.
export function scoreSummary(progress = []) {
  const missions = scoringRules.missions.map((rule) => ({
    ...rule,
    automaticPoints: progress.find((m) => m.id === rule.id)?.passed
      ? rule.automaticCode
      : 0,
    reviewedCodePoints: null,
    reasoningPoints: null,
    depthPoints: rule.depth ? null : 0,
  }));
  return {
    rules: scoringRules,
    missions,
    automaticPoints: missions.reduce((sum, m) => sum + m.automaticPoints, 0),
    automaticMaximum: 10,
    reviewedPoints: null,
    totalPoints: null,
    learningOutcomesMet: null,
    finalGrade: null,
    status: "Teacher review required",
  };
}
