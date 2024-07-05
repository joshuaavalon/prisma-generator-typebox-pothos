import { join } from "node:path";
import { lowerFirstChar, toFileName, writeTs } from "#utils";
import { IndexMappingGenerator } from "../index-mapping-generator.js";
import { generateEnum } from "./enum.js";

import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { DocumentConfiguration } from "#comment";
import type { ImportMapping } from "../index-mapping-generator.js";


interface Context {
  dmmf: DMMF.Document;
  documentCfg: DocumentConfiguration;
}


export class EnumGenerator extends IndexMappingGenerator {
  private readonly dmmf: DMMF.Document;
  private readonly documentCfg: DocumentConfiguration;

  public constructor(cfg: Configuration, ctx: Context) {
    super(cfg, "Enums");
    const { dmmf, documentCfg } = ctx;
    this.dmmf = dmmf;
    this.documentCfg = documentCfg;
  }

  public async generate(outputLocation: string): Promise<void> {
    const mappings: ImportMapping[] = [];
    for (const schemaEnum of this.dmmf.schema.enumTypes.prisma) {
      const { name } = schemaEnum;
      // `TransactionIsolationLevel` should not be mapped because it is internal used only.
      if (name === "TransactionIsolationLevel") {
        continue;
      }
      if (name.endsWith("ScalarFieldEnum")) {
        continue;
      }
      const fileName = toFileName(name);
      mappings.push({ importAlias: lowerFirstChar(name), fileName });
      await writeTs(join(outputLocation, `${fileName}.ts`), generateEnum(this.cfg, { schemaEnum }));
    }
    await writeTs(join(outputLocation, "index.ts"), this.generateIndex(mappings));
  }
}
