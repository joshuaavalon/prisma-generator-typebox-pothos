import ts from "typescript";
import { generateGraphqlName, generateGraphqlType, nonNullArray, schemaBuilderType } from "#utils";
import { generateImports } from "./import.js";
import { generateSchema } from "./schema.js";
import { generatePothosField } from "./pothos-field.js";

import type { Node } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { DocumentConfiguration, ModelConfiguration } from "#comment";

const { factory, SyntaxKind } = ts;


interface Context {
  inputType: DMMF.InputType;
  modelCfg: ModelConfiguration | null;
  documentCfg: DocumentConfiguration;
}

function generateAdd(cfg: Configuration, ctx: Context): Node {
  const { inputType } = ctx;
  const fields = inputType.fields.map(field => generatePothosField(cfg, { ...ctx, field }));
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
          factory.createIdentifier("inputType")
        ),
        undefined,
        [
          factory.createIdentifier("graphqlName"),
          factory.createObjectLiteralExpression(
            [factory.createPropertyAssignment(
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
            )],
            true
          )
        ]
      ))],
      true
    )
  );
}

export function generateInput(cfg: Configuration, ctx: Context): Node[] {
  const { inputType } = ctx;
  const fields = inputType.fields.map(field => {
    const inputTypes = field.inputTypes
      .filter(ref => ref.location !== "fieldRefTypes")
      .filter(ref => ref.location !== "scalar" || ref.type !== "Null")
      .filter(ref => ref.location !== "inputObjectTypes" || (!ref.type.endsWith("FieldUpdateOperationsInput") && !ref.type.includes("Without")))
      // Prevent circular reference
      .filter(ref => !(inputType.name.endsWith("WhereInput") && (ref.type.endsWith("RelationFilter") || ref.type.endsWith("WhereInput"))));
    return { ...field, inputTypes };
  });
  const newCtx = { ...ctx, inputType: { ...ctx.inputType, fields } };
  return [
    ...generateImports(cfg, newCtx),
    factory.createIdentifier("\n"),
    generateSchema(cfg, newCtx),
    factory.createIdentifier("\n"),
    generateGraphqlType(),
    factory.createIdentifier("\n"),
    generateGraphqlName(newCtx.inputType.name),
    factory.createIdentifier("\n"),
    generateAdd(cfg, newCtx)
  ];
}
