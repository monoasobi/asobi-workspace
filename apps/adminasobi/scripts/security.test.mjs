import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { parseMusicId } from "../src/lib/musicId.ts";
import {
  createAdminSession,
  verifyAdminSession,
  verifyAdminCredentials,
} from "../src/server/auth/admin.ts";
import { rejectCrossOrigin } from "../src/server/auth/request.ts";

test("admin session audience, role, expiry and same-origin write boundaries", () => {
  const saved = { ...process.env };
  try {
    process.env.ADMIN_SESSION_SECRET = "local-test-secret";
    process.env.ADMIN_PASSWORD = "local-test-admin";
    process.env.ADMIN_VIEWER_PASSWORDS = "local-test-viewer";
    assert.equal(verifyAdminCredentials("local-test-admin"), "admin");
    assert.equal(verifyAdminCredentials("local-test-viewer"), "viewer");
    assert.equal(verifyAdminCredentials("wrong"), null);
    for (const role of ["admin", "viewer"]) {
      assert.deepEqual(verifyAdminSession(createAdminSession(role)), {
        authenticated: true,
        role,
      });
    }
    assert.deepEqual(
      verifyAdminSession(createAdminSession("admin") + "broken"),
      { authenticated: false },
    );
    for (const audience of ["monoasobi", "loudasobi", "adminasobi"]) {
      const payload = Buffer.from(
        JSON.stringify({
          audience,
          role: "admin",
          expiresAt: audience === "adminasobi" ? 0 : Date.now() + 60000,
        }),
      ).toString("base64url");
      const sign = createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
        .update(audience + ":" + payload)
        .digest("hex");
      assert.deepEqual(verifyAdminSession(payload + "." + sign), {
        authenticated: false,
      });
    }
    const request = (headers) =>
      new Request("http://localhost:3102/api/write", {
        method: "POST",
        headers: { host: "127.0.0.1:3102", ...headers },
      });
    assert.equal(
      rejectCrossOrigin(request({ origin: "http://127.0.0.1:3102" })),
      null,
    );
    for (const headers of [
      {},
      { origin: "https://elsewhere.invalid" },
      { origin: "http://127.0.0.1:3102", "sec-fetch-site": "cross-site" },
    ]) {
      assert.equal(rejectCrossOrigin(request(headers))?.status, 403);
    }
  } finally {
    for (const key of [
      "ADMIN_SESSION_SECRET",
      "ADMIN_PASSWORD",
      "ADMIN_VIEWER_PASSWORDS",
    ]) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});

test("song IDs preserve zero and reject ambiguous numeric input", () => {
  assert.equal(parseMusicId("0"), 0);
  assert.equal(parseMusicId("12"), 12);
  for (const raw of ["-1", "1.5", "1e3", "", " ", "9007199254740992"])
    assert.equal(parseMusicId(raw), null);
});

test("refresh requires an explicit success response and safely reports notification failures", async (context) => {
  const { refreshPublicCatalog } = await import("../src/server/refresh.ts");
  const keys = ["MONOASOBI_URL", "MONOASOBI_REVALIDATION_SECRET"];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.MONOASOBI_URL = "http://localhost:3100";
    process.env.MONOASOBI_REVALIDATION_SECRET = "local-refresh-test";
    const mocked = context.mock.method(
      globalThis,
      "fetch",
      async (url, options) => {
        assert.equal(new URL(url).pathname, "/api/internal/revalidate");
        assert.equal(
          options.headers.Authorization,
          "Bearer local-refresh-test",
        );
        assert.equal(options.redirect, "error");
        assert.equal(options.cache, "no-store");
        return Response.json({ ok: true });
      },
    );
    assert.deepEqual(await refreshPublicCatalog(["monoasobi"]), [
      { target: "monoasobi", ok: true },
    ]);
    mocked.mock.mockImplementation(async () => Response.json({}));
    assert.deepEqual(await refreshPublicCatalog(["monoasobi"]), [
      { target: "monoasobi", ok: false },
    ]);
    mocked.mock.mockImplementation(async () => {
      throw new Error("offline");
    });
    assert.deepEqual(await refreshPublicCatalog(["monoasobi"]), [
      { target: "monoasobi", ok: false },
    ]);
    delete process.env.MONOASOBI_REVALIDATION_SECRET;
    assert.deepEqual(await refreshPublicCatalog(["monoasobi"]), [
      { target: "monoasobi", ok: false },
    ]);
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});
