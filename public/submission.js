// Läs bara uppgifternas HTML och JavaScript från samma lokala server.
export function sourceTargets(missions) {
  return missions.flatMap((m) =>
    [
      ...new Set([
        m.file,
        `public/missions/${String(m.id).padStart(2, "0")}/index.html`,
      ]),
    ].map((path) => ({ missionId: m.id, path })),
  );
}

export async function collectSourceFiles(missions, fetchFile = fetch) {
  const files = await Promise.all(
    sourceTargets(missions).map(async (target) => {
      try {
        const response = await fetchFile(
          "/" + target.path.replace(/^public\//, ""),
          {
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) throw new Error("HTTP " + response.status);
        return {
          ...target,
          status: "included",
          content: await response.text(),
        };
      } catch (error) {
        return {
          ...target,
          status: "missing",
          error: error.message || "Request failed",
        };
      }
    }),
  );
  return {
    capturedAt: new Date().toISOString(),
    complete: files.every((f) => f.status === "included"),
    files,
  };
}

const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// Kod visas som text; skript och HTML i elevens filer körs aldrig i rapporten.
export function sourceSection(sources, missionId, language) {
  const sv = language === "sv";
  return sources.files
    .filter((f) => f.missionId === missionId)
    .map(
      (f) =>
        `<h3>${sv ? "Sparad kod" : "Saved code"}: ${escape(f.path)}</h3>` +
        (f.status === "included"
          ? `<pre class="source-code"><code>${escape(f.content)}</code></pre>`
          : `<p class="missing-code">${sv ? "KODFIL SAKNAS — lämna denna fil separat eller starta servern och ladda ned rapporten igen." : "CODE FILE MISSING — submit this file separately or start the server and download the report again."} (${escape(f.error)})</p>`),
    )
    .join("");
}
