import { Value } from "@sinclair/typebox/value";
import { configurationSchema } from "#config";
import { writeJson } from "#utils";
import { Generator } from "./generator/index.js";

import type { GeneratorOptions } from "@prisma/generator-helper";

export async function onGenerate(options: GeneratorOptions): Promise<void> {
  try {
    const outputLocation = options.generator.output?.value;
    // TODO: Check is Dir
    if (!outputLocation) {
      throw new Error("Output is not defined");
    }
    const cfg = Value.Decode(configurationSchema, options.generator.config);
    await writeJson(outputLocation, options.dmmf);
    await new Generator(options.dmmf, cfg).generate(outputLocation);
  } catch (err) {
    console.log(err);
  }
}
