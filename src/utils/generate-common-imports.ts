import ts from "typescript";
import { nonNullArray } from "#utils";

import type { ImportSpecifier, Node } from "typescript";

const { factory } = ts;


/**
 * Generate TypeBox import. See `@example` for generated code.
 *
 * @example
 * import { Type } from "@sinclair/typebox";
 */
function generateTypeBoxImports(): Node {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([factory.createImportSpecifier(
        false,
        undefined,
        factory.createIdentifier("Type")
      )])
    ),
    factory.createStringLiteral("@sinclair/typebox")
  );
}

/**
 * Generate common filter imports. See `@example` for generated code.
 *
 * @example
 * import { graphqlNullable, graphqlOptional } from "../utils/index.js";
 */
function generateUtilsImports(opts: Options): Node | null {
  const { optional, nullable } = opts;
  if (!optional && !nullable) {
    return null;
  }
  const imports: ImportSpecifier[] = [];
  if (nullable) {
    imports.push(factory.createImportSpecifier(
      false,
      undefined,
      factory.createIdentifier("graphqlNullable")
    ));
  }
  if (optional) {
    imports.push(factory.createImportSpecifier(
      false,
      undefined,
      factory.createIdentifier("graphqlOptional")
    ));
  }
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(false, undefined, factory.createNamedImports(imports)),
    factory.createStringLiteral("../utils/index.js")
  );
}

interface Options {
  nullable?: boolean;
  optional?: boolean;
}

/**
 * Generate common filter imports. See `@example` for generated code.
 *
 * @example
 * import { Type } from "@sinclair/typebox";
 * import { graphqlNullable, graphqlOptional } from "../utils/index.js";
 */
export function generateCommonImports(opts: Options): Node[] {
  return nonNullArray([
    generateTypeBoxImports(),
    generateUtilsImports(opts)
  ]);
}
