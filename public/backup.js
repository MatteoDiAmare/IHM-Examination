// Säkerhetskopia och validering av provsessioner. Ren logik utan DOM, så den kan testas i Node.
// Backup file format and session validation. Pure logic without the DOM so it can be tested in Node.
export const backupFormat = "backstage-backup";
export const backupFormatVersion = 1;
export const sessionVersion = "0.1.0";
export const maxBackupBytes = 5 * 1024 * 1024;
const idPattern = /^[a-zA-Z0-9-]{1,80}$/;
const maxAnswerLength = 50000;
const views = ["tutorial", "map", "mission", "report"];

const isText = (value, max) => typeof value === "string" && value.length <= max;
const isDate = (value) =>
  typeof value === "string" &&
  value.length <= 40 &&
  !Number.isNaN(Date.parse(value));

// Returnerar en ren kopia med bara kända fält, eller { error } utan att röra något.
// Returns a clean copy with known fields only, or { error } without touching anything.
export function validateSession(value, missionIds = [1, 2, 3, 4, 5, 6, 7]) {
  const bad = (error) => ({ error });
  if (!value || typeof value !== "object" || Array.isArray(value))
    return bad("not-an-object");
  if (value.version !== sessionVersion) return bad("version");
  if (typeof value.id !== "string" || !idPattern.test(value.id))
    return bad("id");
  if (!isText(value.firstName, 80) || !isText(value.lastName, 80))
    return bad("name");
  if (!value.firstName.trim() || !value.lastName.trim()) return bad("name");
  if (!isDate(value.startedAt)) return bad("startedAt");
  if (value.finishedAt != null && !isDate(value.finishedAt))
    return bad("finishedAt");
  if (value.updatedAt != null && !isDate(value.updatedAt))
    return bad("updatedAt");
  if (
    !Array.isArray(value.missions) ||
    value.missions.length !== missionIds.length
  )
    return bad("missions");
  const missions = [];
  for (const [index, m] of value.missions.entries()) {
    if (!m || typeof m !== "object" || m.id !== missionIds[index])
      return bad("mission-" + (index + 1));
    if (
      !m.answers ||
      typeof m.answers !== "object" ||
      Array.isArray(m.answers) ||
      !Object.values(m.answers).every((v) => isText(v, maxAnswerLength)) ||
      Object.keys(m.answers).length > 20
    )
      return bad("answers-" + (index + 1));
    if (!Array.isArray(m.attempts) || m.attempts.length > 50)
      return bad("attempts-" + (index + 1));
    if (typeof m.passed !== "boolean") return bad("passed-" + (index + 1));
    missions.push({
      id: m.id,
      answers: { ...m.answers },
      attempts: m.attempts,
      passed: m.passed,
    });
  }
  if (
    value.practiceAnswer != null &&
    !isText(value.practiceAnswer, maxAnswerLength)
  )
    return bad("practiceAnswer");
  const session = {
    version: sessionVersion,
    id: value.id,
    firstName: value.firstName,
    lastName: value.lastName,
    language: value.language === "en" ? "en" : "sv",
    startedAt: value.startedAt,
    finishedAt: value.finishedAt ?? null,
    missions,
  };
  if (value.updatedAt) session.updatedAt = value.updatedAt;
  if (value.practiceComplete === true) session.practiceComplete = true;
  if (value.practiceAnswer) session.practiceAnswer = value.practiceAnswer;
  const position = value.position;
  if (
    position &&
    views.includes(position.view) &&
    Number.isInteger(position.current) &&
    position.current >= 1 &&
    position.current <= missionIds.length
  )
    session.position = { view: position.view, current: position.current };
  return { session };
}

export function createBackup(state, now = new Date()) {
  return JSON.stringify(
    {
      format: backupFormat,
      formatVersion: backupFormatVersion,
      exportedAt: now.toISOString(),
      note: "Backstage backup of exam answers and progress. Not the submission file. / Säkerhetskopia av provsvar och framsteg. Inte inlämningsfilen.",
      session: state,
    },
    null,
    2,
  );
}

const pad = (n) => String(n).padStart(2, "0");
export function backupFilename(state, now = new Date()) {
  const name =
    (state.firstName + "_" + state.lastName)
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .replace(/^_+$/, "") || "elev";
  return `sakerhetskopia_${name}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.json`;
}

// Läser en fil som text. Äldre JSON-exporter (hela sessionen) accepteras också.
// Parses file text. Older JSON exports (the whole session) are accepted too.
export function parseBackup(text, missionIds) {
  if (typeof text !== "string" || !text.trim()) return { error: "empty" };
  if (text.length > maxBackupBytes) return { error: "too-large" };
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: "not-json" };
  }
  if (!data || typeof data !== "object") return { error: "not-an-object" };
  let raw = data;
  let exportedAt = null;
  if (data.format !== undefined) {
    if (data.format !== backupFormat) return { error: "format" };
    if (data.formatVersion !== backupFormatVersion)
      return { error: "format-version" };
    raw = data.session;
    exportedAt = isDate(data.exportedAt) ? data.exportedAt : null;
  }
  const result = validateSession(raw, missionIds);
  if (result.error) return result;
  return { session: result.session, exportedAt };
}
