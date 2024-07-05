import ts from "typescript";

import type { Node } from "typescript";

const { factory, SyntaxKind } = ts;

function generateImports(): Node[] {
  return [
    factory.createImportDeclaration(
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
    ),
    factory.createIdentifier("\n"),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports([factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier("TSchema")
        )])
      ),
      factory.createStringLiteral("@sinclair/typebox")
    )
  ];
}


function generateFunction(): Node {
  return factory.createFunctionDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier("graphqlOptional"),
    [factory.createTypeParameterDeclaration(
      undefined,
      factory.createIdentifier("T"),
      factory.createTypeReferenceNode(
        factory.createIdentifier("TSchema"),
        undefined
      ),
      undefined
    )],
    [factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier("schema"),
      undefined,
      factory.createTypeReferenceNode(
        factory.createIdentifier("T"),
        undefined
      ),
      undefined
    )],
    undefined,
    factory.createBlock(
      [factory.createReturnStatement(factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("Type"),
          factory.createIdentifier("Optional")
        ),
        undefined,
        [factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("Type"),
                    factory.createIdentifier("Transform")
                  ),
                  undefined,
                  [factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("Type"),
                      factory.createIdentifier("Union")
                    ),
                    undefined,
                    [factory.createArrayLiteralExpression(
                      [
                        factory.createIdentifier("schema"),
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("Type"),
                            factory.createIdentifier("Null")
                          ),
                          undefined,
                          []
                        ),
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createIdentifier("Type"),
                            factory.createIdentifier("Undefined")
                          ),
                          undefined,
                          []
                        )
                      ],
                      false
                    )]
                  )]
                ),
                factory.createIdentifier("Decode")
              ),
              undefined,
              [factory.createArrowFunction(
                undefined,
                undefined,
                [factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  factory.createIdentifier("v"),
                  undefined,
                  undefined,
                  undefined
                )],
                undefined,
                factory.createToken(SyntaxKind.EqualsGreaterThanToken),
                factory.createBinaryExpression(
                  factory.createIdentifier("v"),
                  factory.createToken(SyntaxKind.QuestionQuestionToken),
                  factory.createIdentifier("undefined")
                )
              )]
            ),
            factory.createIdentifier("Encode")
          ),
          undefined,
          [factory.createArrowFunction(
            undefined,
            undefined,
            [factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier("v"),
              undefined,
              undefined,
              undefined
            )],
            undefined,
            factory.createToken(SyntaxKind.EqualsGreaterThanToken),
            factory.createIdentifier("v")
          )]
        )]
      ))],
      true
    )
  );
}


/**
 * Generate `graphqlOptional()`. See `@example` for generated code.
 *
 * @example
 * import { Type } from "@sinclair/typebox";
 *
 * import type { TSchema } from "@sinclair/typebox";
 *
 * export function graphqlOptional<T extends TSchema>(schema: T) {
 *   return Type.Optional(Type.Transform(Type.Union([schema, Type.Null(), Type.Undefined()]))
 *     .Decode(v => v ?? undefined)
 *     .Encode(v => v));
 * }
 */
export function generateGraphqlOptional(): Node[] {
  return [
    ...generateImports(),
    factory.createIdentifier("\n"),
    generateFunction()
  ];
}
