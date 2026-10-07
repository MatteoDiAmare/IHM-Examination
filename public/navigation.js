// Spara bara navigationen här; elevens provsvar sparas separat.
// Store navigation only; exam answers are persisted separately.
const navigationKey = "backstage-navigation-v1";
const allowedViews = ["welcome", "tutorial", "map", "mission", "report"];

export function restoreNavigation(storage, state) {
  const fallback = { view: "welcome", current: 1 };
  if (!state) return fallback;
  try {
    const saved = JSON.parse(storage.getItem(navigationKey));
    if (saved?.sessionId !== state.id) return fallback;
    if (!allowedViews.includes(saved.view)) return fallback;
    if (
      !Number.isInteger(saved.current) ||
      saved.current < 1 ||
      saved.current > 7
    )
      return fallback;
    return { view: saved.view, current: saved.current };
  } catch {
    return fallback;
  }
}

// Läs sparat sessions-ID även när provet inte kunnat återställas ännu.
// Read the saved session ID even when the exam has not been restored yet.
export function savedSessionId(storage) {
  try {
    const id = JSON.parse(storage.getItem(navigationKey))?.sessionId;
    return typeof id === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(id)
      ? id
      : null;
  } catch {
    return null;
  }
}

export function clearNavigation(storage) {
  try {
    storage.removeItem(navigationKey);
  } catch {}
}

// Utan state rör vi ingenting: ID:t ska överleva ett misslyckat återställningsförsök.
// Without state we touch nothing: the ID must survive a failed restore attempt.
export function saveNavigation(storage, state, view, current) {
  try {
    if (!state) return;
    storage.setItem(
      navigationKey,
      JSON.stringify({ sessionId: state.id, view, current }),
    );
  } catch {
    // Om lagring är blockerad fungerar navigationen fortfarande i den öppna sidan.
    // Navigation still works in the current page if browser storage is blocked.
  }
}
