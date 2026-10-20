import type { NextConfig } from "next";
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = realpathSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../.."),
);

const nextConfig: NextConfig = {
  transpilePackages: ["@asobi/ui", "@asobi/content-core", "@asobi/database"],
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
};

export default nextConfig;
