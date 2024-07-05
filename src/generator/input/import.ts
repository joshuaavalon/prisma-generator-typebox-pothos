import ts from "typescript";
import { generateCommonImports, generateTypeImports, lowerFirstChar, nonNullArray, toFileName } from "#utils";
import { isUnchecked } from "./is-unchecked.js";

import type { Node } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";

const { factory } = ts;


interface Context {
  inputType: DMMF.InputType;
}

function generateObjectTypeImports(cfg: Configuration, ctx: Context): Node[] {
  const { inputType } = ctx;
  const objectTypes = inputType.fields.flatMap(field => field.inputTypes
    .filter(inputTypeRef => cfg.enableUnchecked ?? !isUnchecked(inputTypeRef.type))
    .filter(inputTypeRef => inputTypeRef.location === "inputObjectTypes" && inputTypeRef.type !== inputType.name)
    .flatMap(inputTypeRef => inputTypeRef.type));
  const typeSets = new Set(objectTypes);
  return [...typeSets].sort().map(typeName => {
    const alias = lowerFirstChar(typeName);
    const fileName = toFileName(typeName);
    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier(alias))
      ),
      factory.createStringLiteral(`./${fileName}.js`)
    );
  });
}

function generateEnumImports(ctx: Context): Node[] {
  const { inputType } = ctx;
  const objectTypes = inputType.fields.flatMap(field => field.inputTypes
    .filter(inputTypeRef => inputTypeRef.location === "enumTypes")
    .flatMap(inputTypeRef => inputTypeRef.type));
  const typeSets = new Set(objectTypes);
  return [...typeSets].sort().map(typeName => {
    const alias = lowerFirstChar(typeName);
    const fileName = toFileName(typeName);
    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier(alias))
      ),
      factory.createStringLiteral(`../enum/${fileName}.js`)
    );
  });
}

export function generateImports(cfg: Configuration, ctx: Context): Node[] {
  const { inputType } = ctx;
  const nullable = inputType.fields.some(field => field.isNullable);
  const optional = inputType.fields.some(field => !field.isRequired);
  return nonNullArray([
    ...generateCommonImports({ nullable, optional }),
    ...generateEnumImports(ctx),
    ...generateObjectTypeImports(cfg, ctx),
    factory.createIdentifier("\n"),
    ...generateTypeImports(cfg)
  ]);
}
