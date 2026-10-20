import type { NextConfig } from "next";
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Use one canonical workspace root, including hoisted dependencies and packages.
const nextConfigDir = realpathSync(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = resolve(nextConfigDir, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@asobi/content-core", "@asobi/database"],
  cacheComponents: true,
  reactCompiler: {
    compilationMode: "infer",
  },
  turbopack: {
    root: workspaceRoot,
  },
  outputFileTracingRoot: workspaceRoot,
};

export default nextConfig;
