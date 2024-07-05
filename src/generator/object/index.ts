import { join } from "node:path";
import { lowerFirstChar, toFileName, writeTs } from "#utils";
import { IndexMappingGenerator } from "../index-mapping-generator.js";
import { generateObject } from "./object.js";

import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { DocumentConfiguration } from "#comment";
import type { ImportMapping } from "../index-mapping-generator.js";

interface Context {
  dmmf: DMMF.Document;
  documentCfg: DocumentConfiguration;
}

export class ObjectGenerator extends IndexMappingGenerator {
  private readonly dmmf: DMMF.Document;
  private readonly documentCfg: DocumentConfiguration;

  public constructor(cfg: Configuration, ctx: Context) {
    super(cfg);
    const { dmmf, documentCfg } = ctx;
    this.dmmf = dmmf;
    this.documentCfg = documentCfg;
  }

  public async generate(outputLocation: string): Promise<void> {
    const mappings: ImportMapping[] = [];
    for (const model of this.dmmf.datamodel.models) {
      const { name } = model;
      const modelCfg = this.documentCfg[name];
      if (modelCfg.ignore) {
        continue;
      }
      const fileName = toFileName(name);
      mappings.push({ importAlias: lowerFirstChar(name), fileName });
      await writeTs(join(outputLocation, `${fileName}.ts`), generateObject(this.cfg, { model, modelCfg }));
    }
    await writeTs(join(outputLocation, "index.ts"), this.generateIndex(mappings));
  }
}
