import ts from "typescript";
import { nonNullArray } from "#utils";
import { generateField } from "./field/index.js";

import type { Node, PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { ModelConfiguration } from "#comment";

const { factory, SyntaxKind } = ts;


interface Context {
  model: DMMF.Model;
  modelCfg: ModelConfiguration;
}

function generateImports(cfg: Configuration): Node[] {
  return nonNullArray([
    cfg.authScopes
      ? factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports([factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier("authScopes")
          )])
        ),
        factory.createStringLiteral(cfg.authScopes)
      )
      : null,
    cfg.authScopes ? factory.createIdentifier("\n") : null,
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
  ]);
}

function generateInterfaces(model: DMMF.Model, modelCfg: ModelConfiguration): PropertyAssignment | null {
  const { interfaces } = modelCfg;
  if (interfaces.length <= 0) {
    return null;
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier("interfaces"),
    factory.createArrayLiteralExpression(
      [factory.createStringLiteral("Item")],
      false
    )
  );
}

function generateSelects(modelCfg: ModelConfiguration): PropertyAssignment | null {
  const selects = Object.entries(modelCfg.fields).filter(([, fieldCfg]) => fieldCfg.select)
    .map(([name]) => factory.createPropertyAssignment(factory.createIdentifier(name), factory.createTrue()));
  if (selects.length <= 0) {
    return null;
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier("select"),
    factory.createObjectLiteralExpression(selects)
  );
}


function generateFunction(cfg: Configuration, ctx: Context): Node {
  const { model, modelCfg } = ctx;
  const fields = model.fields.map(field => generateField(cfg, { field, fieldCfg: modelCfg.fields[field.name] }));
  const schemaBuilderType = factory.createTypeReferenceNode(
    factory.createQualifiedName(
      factory.createIdentifier("PothosSchemaTypes"),
      factory.createIdentifier("SchemaBuilder")
    ),
    [factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("PothosSchemaTypes"),
        factory.createIdentifier("ExtendDefaultTypes")
      ),
      [factory.createTypeReferenceNode(
        factory.createIdentifier("SchemaType"),
        undefined
      )]
    )]
  );
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
      schemaBuilderType
    )],
    factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
    factory.createBlock(
      [factory.createExpressionStatement(factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("builder"),
          factory.createIdentifier("prismaObject")
        ),
        undefined,
        [
          factory.createStringLiteral(model.name),
          factory.createObjectLiteralExpression(
            nonNullArray([
              generateSelects(modelCfg),
              generateInterfaces(model, modelCfg),
              factory.createPropertyAssignment(
                factory.createIdentifier("fields"),
                factory.createArrowFunction(
                  undefined,
                  undefined,
                  [factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier("t"),
                    undefined,
                    undefined,
                    undefined
                  )],
                  undefined,
                  factory.createToken(SyntaxKind.EqualsGreaterThanToken),
                  factory.createParenthesizedExpression(factory.createObjectLiteralExpression(
                    nonNullArray(fields),
                    true
                  ))
                )
              )
            ]),
            true
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
 * import { authScopes } from "#authScopes";
 *
 * import type { SchemaType } from "#typePackage";
 *
 * export function add(builder: PothosSchemaTypes.SchemaBuilder<PothosSchemaTypes.ExtendDefaultTypes<SchemaType>>): void {
 *   builder.prismaObject("Record", {
 *     select: { id: true },
 *     interfaces: ["Item"],
 *     fields: t => ({
 *       id: t.expose("id", { type: "UUID", authScopes }),
 *       createdAt: t.expose("createdAt", { type: "DateTime", authScopes }),
 *       updatedAt: t.expose("updatedAt", { type: "DateTime", authScopes })
 *     })
 *   });
 * }
 */
export function generateObject(cfg: Configuration, ctx: Context): Node[] {
  return [
    ...generateImports(cfg),
    factory.createIdentifier("\n"),
    generateFunction(cfg, ctx)
  ];
}
