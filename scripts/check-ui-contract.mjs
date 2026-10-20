import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const baseline = JSON.parse(await read("docs/novel-style-baseline.json"));
for (const [name, expected] of Object.entries(baseline.hashes)) {
  let text = await read("apps/monoasobi/src/" + name);
  if (baseline.radixReplacement.hashes[name]) {
    assert.equal(
      sha(text),
      baseline.radixReplacement.hashes[name],
      `Reviewed novel renderer changed: ${name}`,
    );
    continue;
  }
  if (name.endsWith("NovelReader.module.css"))
    text = text.replaceAll(
      '[data-slot="scroll-area-viewport"]',
      ':global(.rt-ScrollAreaViewport)',
    );
  if (name.endsWith("NovelMarkdown.module.css")) {
    const preservedColor =
      "\n/* Preserve the original reading color independently of surrounding UI cards. */\n.root {\n  color: var(--gray-12);\n}\n";
    assert(text.endsWith(preservedColor), "Only the original reading color may be appended");
    text = text.slice(0, -preservedColor.length);
  }
  assert.equal(
    sha(text),
    expected,
    `User-authored novel contract changed: ${name}`,
  );
}
async function walk(dir) {
  const path = resolve(root, dir);
  return (await readdir(path, { withFileTypes: true }))
    .flatMap((e) => (e.isDirectory() ? [] : [dir + "/" + e.name]))
    .concat(
      (
        await Promise.all(
          (await readdir(path, { withFileTypes: true }))
            .filter((e) => e.isDirectory())
            .map((e) => walk(dir + "/" + e.name)),
        )
      ).flat(),
    );
}
const publicFiles = (await walk("apps/monoasobi/src")).filter(
  (p) => !p.includes("/admin/"),
);
assert.deepEqual(
  publicFiles
    .filter((p) => p.endsWith(".module.css"))
    .map((p) => p.split("/").at(-1))
    .sort(),
  ["NovelMarkdown.module.css", "NovelReader.module.css"],
);
assert.equal(
  (await walk("apps/adminasobi/src")).some((p) => p.endsWith(".module.css")),
  false,
);
for (const p of publicFiles.filter(
  (p) =>
    p.endsWith(".tsx") &&
    !p.endsWith("/providers.tsx"),
)) {
  assert(
    !(await read(p)).includes("@radix-ui/themes"),
    `Unmigrated public component: ${p}`,
  );
}
const css = await read("apps/monoasobi/src/app/globals.css");
assert(!css.includes("tailwindcss/preflight"));
assert(css.includes("layer(legacy)"));
const roles = await read("packages/ui/src/styles.css");
for (const role of [
  "type-page-title",
  "type-section-title",
  "type-body",
  "type-description",
  "type-label",
  "type-caption",
  "type-lyric-jp",
  "type-lyric-translation",
  "type-call-source",
  "type-call-translation",
])
  assert(roles.includes("@utility " + role));
const playback = await read(
  "apps/monoasobi/src/components/common/VideoPlayer.styles.ts",
);
assert(
  playback.includes("100dvh_-_env("),
  "CSS calc subtraction must retain whitespace",
);
console.log(
  "UI contracts passed: preserved novel module rules, reviewed Tailwind renderer, no public Themes components, shared UI/read roles and retired module boundaries.",
);
