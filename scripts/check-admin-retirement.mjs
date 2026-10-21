import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

for (const app of ["monoasobi", "loudasobi"]) {
  const root = `apps/${app}`;
  for (const path of ["src/app/api/admin", "src/server/auth/admin.ts", "src/server/mutations", "src/server/queries/admin.ts"])
    assert(!existsSync(`${root}/${path}`), `${app}: legacy writes/auth remain at ${path}`);
  assert.deepEqual(readdirSync(`${root}/src/app/admin`), ["[[...path]]"]);
  const notice = readFileSync(`${root}/src/app/admin/[[...path]]/page.tsx`, "utf8");
  assert(notice.includes("MINASOBI"));
  assert(notice.includes("index: false"));
  for (const path of readdirSync(`${root}/src`, { recursive: true }).filter((path) => /\.[jt]sx?$/.test(path))) {
    const source = readFileSync(`${root}/src/${path}`, "utf8");
    assert(!/ADMIN_PASSWORD|ADMIN_SESSION_SECRET|ADMIN_VIEWER_PASSWORDS|adminNavigationAtom|requireAdminSession/.test(source), `${app}: legacy admin reference at ${path}`);
  }
}
for (const path of [
  "apps/monoasobi/src/app/api/content/novels/[id]/route.ts",
  "apps/monoasobi/src/app/api/content/comics/[id]/route.ts",
  "apps/monoasobi/src/app/api/content/comic-file/[...key]/route.ts",
  "apps/monoasobi/src/app/api/content/albumart/[id]/[file]/route.ts",
  "apps/monoasobi/src/app/api/private-reader/auth/login/route.ts",
  "apps/monoasobi/src/app/api/agent/catalog/route.ts",
  "apps/monoasobi/src/app/api/internal/revalidate/route.ts",
  "apps/minasobi/src/app/api/admin/novels/[id]/route.ts",
  "apps/minasobi/src/app/api/admin/musics/[id]/lyrics/route.ts",
  "apps/minasobi/src/app/api/admin/musics/[id]/guide/route.ts",
]) assert(existsSync(path), `Preserved route missing: ${path}`);
assert(readFileSync("apps/loudasobi/src/server/queries/sidebar.ts", "utf8").includes("readSidebarLayout"));
console.log("Legacy admin writes/auth removed; notices, public content, reader/Agent auth, cache API and MINASOBI editors preserved.");
