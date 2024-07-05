import ts from "typescript";

import type { Node } from "typescript";

const { factory, SyntaxKind } = ts;


/**
 * Generate `GraphqlType`. See `@example` for generated code.
 *
 * @example
 * export type GraphqlType = StaticEncode<typeof schema>;
 */
export function generateGraphqlType(): Node {
  return factory.createTypeAliasDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createIdentifier("GraphqlType"),
    undefined,
    factory.createTypeReferenceNode(
      factory.createIdentifier("StaticEncode"),
      [factory.createTypeQueryNode(factory.createIdentifier("schema"))]
    )
  );
}
