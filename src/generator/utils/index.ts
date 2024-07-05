import { join } from "node:path";
import ts from "typescript";
import { writeTs } from "#utils";
import { generateGraphqlNullable } from "./graphql-nullable.js";
import { generateGraphqlOptional } from "./graphql-optional.js";

import type { Node } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";

const { factory } = ts;

interface Context {
  dmmf: DMMF.Document;
}

export class UtilsGenerator {
  private readonly dmmf: DMMF.Document;
  private readonly cfg: Configuration;

  public constructor(cfg: Configuration, ctx: Context) {
    this.cfg = cfg;
    const { dmmf } = ctx;
    this.dmmf = dmmf;
  }

  private generateExports(): Node[] {
    return [
      factory.createExportDeclaration(
        undefined,
        false,
        undefined,
        factory.createStringLiteral("./graphql-optional.js")
      ),
      factory.createExportDeclaration(
        undefined,
        false,
        undefined,
        factory.createStringLiteral("./graphql-nullable.js")
      )
    ];
  }

  public async generate(outputLocation: string): Promise<void> {
    await writeTs(join(outputLocation, "index.ts"), this.generateExports());
    await writeTs(join(outputLocation, "graphql-nullable.ts"), generateGraphqlNullable());
    await writeTs(join(outputLocation, "graphql-optional.ts"), generateGraphqlOptional());
  }
}
