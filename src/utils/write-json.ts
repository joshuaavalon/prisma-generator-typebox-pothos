import { writeFile } from "node:fs/promises";

import type { DMMF } from "@prisma/generator-helper";

export async function writeJson(outputPath: string, dmmf: DMMF.Document): Promise<void> {
  await writeFile(`${outputPath}.json`, JSON.stringify(dmmf, null, 2), { encoding: "utf-8" });
}
