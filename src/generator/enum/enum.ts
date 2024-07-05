import ts from "typescript";
import { generateCommonImports, generateGraphqlName, generateGraphqlType, generateTypeImports, nonNullArray, schemaBuilderType } from "#utils";

import type { Node, VariableStatement } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";

const { factory, SyntaxKind } = ts;


interface Context {
  schemaEnum: DMMF.SchemaEnum;
}

function generateImports(cfg: Configuration): Node[] {
  return nonNullArray([
    ...generateCommonImports({}),
    factory.createIdentifier("\n"),
    ...generateTypeImports(cfg)
  ]);
}

function generateSchema(schemaEnum: DMMF.SchemaEnum): VariableStatement {
  const values = schemaEnum.values.map(v => factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("Type"),
      factory.createIdentifier("Literal")
    ),
    undefined,
    [factory.createStringLiteral(v)]
  ));
  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier("schema"),
        undefined,
        undefined,
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("Type"),
            factory.createIdentifier("Union")
          ),
          undefined,
          [factory.createArrayLiteralExpression(values, values.length > 3)]
        )
      )],
      ts.NodeFlags.Const
    )
  );
}

export function generateAdd(schemaEnum: DMMF.SchemaEnum): Node {
  const values = schemaEnum.values.map(v => factory.createStringLiteral(v));
  return factory.createFunctionDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier("add"),
    undefined,
    [factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createIdentifier("builder"),
      undefined,
      schemaBuilderType(),
      undefined
    )],
    factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
    factory.createBlock(
      [factory.createExpressionStatement(factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("builder"),
          factory.createIdentifier("enumType")
        ),
        undefined,
        [
          factory.createStringLiteral(schemaEnum.name),
          factory.createObjectLiteralExpression(
            [factory.createPropertyAssignment(
              factory.createIdentifier("values"),
              factory.createAsExpression(
                factory.createArrayLiteralExpression(values, values.length > 3),
                factory.createTypeReferenceNode(factory.createIdentifier("const"))
              )
            )],
            false
          )
        ]
      ))],
      true
    )
  );
}

/**
 * Generate Prisma model. See `@example` for generated code.
 *
 * @example
 * import { Type } from "@sinclair/typebox";
 *
 * import type { StaticEncode } from "@sinclair/typebox";
 * import type { SchemaType } from "#schema";
 *
 * export const schema = Type.Union([Type.Literal("asc"), Type.Literal("desc")]);
 *
 * export type GraphqlType = StaticEncode<typeof schema>;
 *
 * export const graphqlName = "SortOrder";
 *
 * export function add(builder: PothosSchemaTypes.SchemaBuilder<PothosSchemaTypes.ExtendDefaultTypes<SchemaType>>): void {
 *     builder.enumType("SortOrder", { values: ["asc", "desc"] as const });
 * }
 */
export function generateEnum(cfg: Configuration, ctx: Context): Node[] {
  return [
    ...generateImports(cfg),
    factory.createIdentifier("\n"),
    generateSchema(ctx.schemaEnum),
    factory.createIdentifier("\n"),
    generateGraphqlType(),
    factory.createIdentifier("\n"),
    generateGraphqlName(ctx.schemaEnum.name),
    factory.createIdentifier("\n"),
    generateAdd(ctx.schemaEnum)
  ];
}
