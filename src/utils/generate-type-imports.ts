import ts from "typescript";

import type { Node } from "typescript";
import type { Configuration } from "#config";

const { factory } = ts;

/**
 * Generate common filter type imports. See `@example` for generated code.
 *
 * @example
 * import type { StaticEncode } from "@sinclair/typebox";
 * import type { SchemaBuilder } from "#schema";
 */
export function generateTypeImports(cfg: Configuration): Node[] {
  return [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports([factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier("StaticEncode")
        )])
      ),
      factory.createStringLiteral("@sinclair/typebox"),
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
          factory.createIdentifier("SchemaType")
        )])
      ),
      factory.createStringLiteral(cfg.typePackage)
    )
  ];
}
