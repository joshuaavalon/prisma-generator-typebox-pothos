import { join } from "node:path";
import ts from "typescript";
import { writeTs } from "#utils";
import { parseComment } from "#comment";
import { EnumGenerator } from "./enum/index.js";
import { InputGenerator } from "./input/index.js";
import { ObjectGenerator } from "./object/index.js";
import { UtilsGenerator } from "./utils/index.js";

import type { Node } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";

const { factory, SyntaxKind } = ts;

export class Generator {
  private readonly enumGenerator: EnumGenerator;
  private readonly inputGenerator: InputGenerator;
  private readonly objectGenerator: ObjectGenerator;
  private readonly utilsGenerator: UtilsGenerator;

  public constructor(dmmf: DMMF.Document, cfg: Configuration) {
    const ctx = { dmmf, documentCfg: parseComment(dmmf) };
    this.enumGenerator = new EnumGenerator(cfg, ctx);
    this.inputGenerator = new InputGenerator(cfg, ctx);
    this.objectGenerator = new ObjectGenerator(cfg, ctx);
    this.utilsGenerator = new UtilsGenerator(cfg, ctx);
  }

  private generateIndex(): Node [] {
    return [
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports([factory.createImportSpecifier(
            false,
            factory.createIdentifier("Inputs"),
            factory.createIdentifier("PrismaInputs")
          )])
        ),
        factory.createStringLiteral("./input/index.js"),
        undefined
      ),
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports([factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier("Enums")
          )])
        ),
        factory.createStringLiteral("./enum/index.js"),
        undefined
      ),
      factory.createTypeAliasDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier("Inputs"),
        undefined,
        factory.createIntersectionTypeNode([
          factory.createTypeReferenceNode(
            factory.createIdentifier("Enums"),
            undefined
          ),
          factory.createTypeReferenceNode(
            factory.createIdentifier("PrismaInputs"),
            undefined
          )
        ])
      )

    ];
  }

  public async generate(outputLocation: string): Promise<void> {
    await this.enumGenerator.generate(join(outputLocation, "enum"));
    await this.inputGenerator.generate(join(outputLocation, "input"));
    await this.objectGenerator.generate(join(outputLocation, "object"));
    await this.utilsGenerator.generate(join(outputLocation, "utils"));
    await writeTs(join(outputLocation, "index.ts"), this.generateIndex());
  }
}
