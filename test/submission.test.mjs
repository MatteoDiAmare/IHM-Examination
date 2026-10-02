import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  collectSourceFiles,
  sourceSection,
  sourceTargets,
} from "../public/submission.js";
const missions = JSON.parse(
  await readFile(new URL("../public/missions.json", import.meta.url), "utf8"),
);

test("submission collects only mission source, bypasses cache, and preserves missing-file evidence", async () => {
  const targets = sourceTargets(missions);
  assert.equal(targets.length, 13);
  assert.equal(new Set(targets.map((f) => f.path)).size, 13);
  assert.ok(
    targets.every((f) =>
      /^public\/missions\/0[1-7]\/(app.js|index.html)$/.test(f.path),
    ),
  );
  const snapshot = await collectSourceFiles(missions, async (url, options) => {
    assert.equal(options.cache, "no-store");
    if (url === "/missions/04/app.js") return { ok: false, status: 404 };
    if (url === "/missions/06/app.js") throw new Error("Server stopped");
    return {
      ok: true,
      text: async () => "<script>window.bad=true</script> & saved code",
    };
  });
  assert.equal(snapshot.complete, false);
  assert.equal(
    snapshot.files.filter((f) => f.status === "included").length,
    11,
  );
  assert.equal(
    snapshot.files.find((f) => f.path.endsWith("04/app.js")).error,
    "HTTP 404",
  );
  const html = sourceSection(snapshot, 1, "sv");
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(sourceSection(snapshot, 4, "sv").includes("KODFIL SAKNAS"));
  assert.ok(sourceSection(snapshot, 6, "en").includes("CODE FILE MISSING"));
});
