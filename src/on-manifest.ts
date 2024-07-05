import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { GeneratorManifest } from "@prisma/generator-helper";


const currentDir = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(currentDir, "..", "package.json");
const packageJsonStr = await readFile(packageJsonPath, { encoding: "utf-8" });
const packageJson = JSON.parse(packageJsonStr);

export function onManifest(): GeneratorManifest {
  return {
    version: packageJson.version,
    defaultOutput: "./ptp.generated.ts",
    prettyName: "Prisma Typebox Pothos Generator",
    requiresGenerators: ["prisma-client-js"]
  };
}
