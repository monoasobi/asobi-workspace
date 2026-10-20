import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchNovelMarkdown } from "../src/components/content/NovelReader/fetchNovelMarkdown";

test("local manuscripts take priority, missing files use R2, HTML and access failures stay errors", async (t) => {
  const cases = [
    { local: true, replies: [new Response("# Local")], paths: ["/novel/4.md"], text: "# Local" },
    { local: true, replies: [new Response("<!DOCTYPE html><html>404</html>", { headers: { "Content-Type": "text/html" } }), new Response("# R2")], paths: ["/novel/4.md", "/api/content/novels/4"], text: "# R2" },
    { local: true, replies: [new Response("Missing", { status: 404 }), new Response("# R2")], paths: ["/novel/4.md", "/api/content/novels/4"], text: "# R2" },
    { local: false, replies: [new Response("# R2")], paths: ["/api/content/novels/4"], text: "# R2" },
    { local: true, replies: [new Response("Missing", { status: 404 }), new Response("Unauthorized", { status: 401 })], paths: ["/novel/4.md", "/api/content/novels/4"], text: undefined },
    { local: true, replies: [new Response("Failed", { status: 500 })], paths: ["/novel/4.md"], text: undefined },
    { local: false, replies: [new Response("<!DOCTYPE html><html>Error</html>")], paths: ["/api/content/novels/4"], text: undefined },
  ];
  for (const scenario of cases) {
    const paths: string[] = [];
    const stub = t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
      paths.push(url);
      if (url.endsWith(".md")) assert.equal(init?.cache, "no-store");
      assert(scenario.replies.length > 0, "Unexpected extra request");
      return scenario.replies.shift()!;
    });
    try {
      if (scenario.text === undefined) await assert.rejects(fetchNovelMarkdown(4, scenario.local));
      else assert.equal(await fetchNovelMarkdown(4, scenario.local), scenario.text);
      assert.deepEqual(paths, scenario.paths);
    } finally {
      stub.mock.restore();
    }
  }
});
