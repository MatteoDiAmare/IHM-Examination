// Använd uppgiftens egna frågefält i både gränssnittet och rapporten.
// Use mission-specific fields in both the UI and the report.
const legacyLabels = {
  sv: {
    observation: "Tidigare svar: Vad såg du i DevTools?",
    cause: "Tidigare svar: Vad tror du orsakar problemet?",
    solution: "Tidigare svar: Hur löser du det — och varför?",
  },
  en: {
    observation: "Previous answer: What did you see in DevTools?",
    cause: "Previous answer: What do you think caused the problem?",
    solution: "Previous answer: How would you fix it — and why?",
  },
};

export function legacyEntries(progress, language) {
  return Object.entries(legacyLabels[language])
    .filter(([key]) => progress.answers[key]?.trim())
    .map(([key, label]) => ({ key, label, value: progress.answers[key] }));
}

export function answerEntries(mission, progress, language) {
  const fields = mission[language].fields.map((field) => ({
    ...field,
    value: progress.answers[field.key] || "",
  }));
  return [...fields, ...legacyEntries(progress, language)];
}
