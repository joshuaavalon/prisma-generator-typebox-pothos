import { join } from "node:path";
import { lowerFirstChar, toFileName, writeTs } from "#utils";
import { IndexMappingGenerator } from "../index-mapping-generator.js";
import { generateInput } from "./input.js";
import { isUnchecked } from "./is-unchecked.js";

import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { DocumentConfiguration, ModelConfiguration } from "#comment";
import type { ImportMapping } from "../index-mapping-generator.js";


interface Context {
  dmmf: DMMF.Document;
  documentCfg: DocumentConfiguration;
}

const ignoreEndWith = ["FieldUpdateOperationsInput", "CreateManyInput", "MutationInput", "WithAggregationInput", "ByAggregateInput", "InputEnvelope"];
const ignoreIncludes = ["Without", "ScalarWhere", "WithAggregatesFilter"];

export class InputGenerator extends IndexMappingGenerator {
  private readonly dmmf: DMMF.Document;
  private readonly documentCfg: DocumentConfiguration;

  public constructor(cfg: Configuration, ctx: Context) {
    super(cfg, "Inputs");
    const { dmmf, documentCfg } = ctx;
    this.dmmf = dmmf;
    this.documentCfg = documentCfg;
  }

  private guessModelCfg(inputType: DMMF.InputType): ModelConfiguration | null {
    if (inputType.meta?.source) {
      return this.documentCfg[inputType.meta.source];
    }
    if (inputType.name.endsWith("CreateInput")) {
      const source = inputType.name.substring(0, inputType.name.length - "CreateInput".length);
      return this.documentCfg[source];
    }
    if (inputType.name.endsWith("UpdateInput")) {
      const source = inputType.name.substring(0, inputType.name.length - "UpdateInput".length);
      return this.documentCfg[source];
    }
    if (inputType.name.endsWith("ScalarWhereInput")) {
      const source = inputType.name.substring(0, inputType.name.length - "ScalarWhereInput".length);
      return this.documentCfg[source];
    }
    if (inputType.name.endsWith("WhereInput")) {
      const source = inputType.name.substring(0, inputType.name.length - "WhereInput".length);
      return this.documentCfg[source];
    }
    return null;
  }


  public async generate(outputLocation: string): Promise<void> {
    const mappings: ImportMapping[] = [];
    for (const inputType of this.dmmf.schema.inputObjectTypes.prisma) {
      const { name } = inputType;
      if (!this.cfg.enableUnchecked && isUnchecked(name)) {
        continue;
      }

      if (ignoreEndWith.some(i => name.endsWith(i))
        || ignoreIncludes.some(i => name.includes(i))
        || (!name.endsWith("CreateManyInput") && name.includes("CreateMany") && name.endsWith("Input"))) {
        continue;
      }
      const modelCfg = this.guessModelCfg(inputType);
      if (modelCfg?.ignore) {
        continue;
      }
      const fileName = toFileName(name);
      mappings.push({ importAlias: lowerFirstChar(name), fileName });
      await writeTs(join(outputLocation, `${fileName}.ts`), generateInput(this.cfg, { inputType, modelCfg, documentCfg: this.documentCfg }));
    }
    await writeTs(join(outputLocation, "index.ts"), this.generateIndex(mappings));
  }
}
