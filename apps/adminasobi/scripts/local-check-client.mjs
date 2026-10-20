import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function localCheckClient(getCookie = () => undefined) {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  process.loadEnvFile(resolve(app, ".env.local"));
  const expectedDatabase = resolve(app, "../../.local/development.sqlite");
  assert.equal(
    process.env.TURSO_DATABASE_URL,
    `file:${expectedDatabase}`,
    "Only the ASOBI synthetic local database is allowed",
  );
  const base = new URL(process.env.ADMIN_CHECK_URL ?? "http://127.0.0.1:3102");
  assert.equal(base.protocol, "http:");
  assert.ok(
    ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname),
    "Only loopback HTTP is allowed",
  );
  for (const key of ["MONOASOBI_URL", "LOUDASOBI_URL"]) {
    const publicUrl = new URL(process.env[key]);
    assert.equal(publicUrl.protocol, "http:");
    assert.ok(
      ["localhost", "127.0.0.1", "[::1]"].includes(publicUrl.hostname),
      "Public refresh checks also require loopback URLs",
    );
  }
  async function call(
    path,
    {
      method = "GET",
      body,
      cookie = getCookie(),
      origin = base.origin,
      headers = {},
    } = {},
  ) {
    const options = {
      method,
      headers: { Origin: origin, ...headers },
      signal: AbortSignal.timeout(60000),
    };
    if (cookie) options.headers.Cookie = cookie;
    if (body !== undefined) {
      if (body instanceof Uint8Array) options.body = body;
      else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }
    const response = await fetch(new URL(path, base), options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { response, status: response.status, data };
  }
  async function login(key) {
    const result = await call("/api/admin/auth/login", {
      method: "POST",
      cookie: "",
      body: { password: process.env[key] },
    });
    assert.equal(result.status, 200);
    return result.response.headers.get("set-cookie").split(";")[0];
  }
  return { call, login, expectedDatabase, base };
}
