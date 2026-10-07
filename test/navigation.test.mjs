import test from "node:test";
import assert from "node:assert/strict";
import {
  clearNavigation,
  restoreNavigation,
  saveNavigation,
  savedSessionId,
} from "../public/navigation.js";

test("reload restores the exact mission for the same student session", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const state = { id: "student-a" };
  saveNavigation(storage, state, "mission", 4);
  assert.deepEqual(restoreNavigation(storage, state), {
    view: "mission",
    current: 4,
  });
  assert.deepEqual(restoreNavigation(storage, { id: "student-b" }), {
    view: "welcome",
    current: 1,
  });
  saveNavigation(storage, state, "tutorial", 1);
  assert.equal(restoreNavigation(storage, state).view, "tutorial");
  // Utan state får sessions-ID:t inte raderas (misslyckad återställning).
  saveNavigation(storage, null, "welcome", 1);
  assert.equal(savedSessionId(storage), "student-a");
  clearNavigation(storage);
  assert.equal(values.size, 0);
  assert.equal(savedSessionId(storage), null);
});
