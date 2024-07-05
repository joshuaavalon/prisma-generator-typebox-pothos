import ts from "typescript";

import type { Node } from "typescript";

const { factory, SyntaxKind } = ts;


/**
 * Generate `graphqlName`. See `@example` for generated code.
 *
 * @example
 * export const graphqlName = "name";
 * @param name graphqlName
 */
export function generateGraphqlName(name: string): Node {
  return factory.createVariableStatement(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier("graphqlName"),
        undefined,
        undefined,
        factory.createStringLiteral(name)
      )],
      ts.NodeFlags.Const
    )
  );
}
