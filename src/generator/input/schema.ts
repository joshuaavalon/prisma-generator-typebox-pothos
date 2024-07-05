import ts from "typescript";
import { nonNullArray } from "#utils";
import { generateSchemaProperty } from "./schema-property.js";

import type { CallExpression, ConciseBody, VariableStatement } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { ModelConfiguration } from "#comment";

interface Context {
  inputType: DMMF.InputType;
  modelCfg: ModelConfiguration | null;
}


const { factory, SyntaxKind } = ts;

function wrapRecursive(body: ConciseBody): CallExpression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("Type"),
      factory.createIdentifier("Recursive")
    ),
    undefined,
    [factory.createArrowFunction(
      undefined,
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("self"),
        undefined,
        undefined,
        undefined
      )],
      undefined,
      factory.createToken(SyntaxKind.EqualsGreaterThanToken),
      body
    )]
  );
}

export function generateSchema(cfg: Configuration, ctx: Context): VariableStatement {
  const { inputType } = ctx;
  const isRecursive = inputType.fields.some(field => field.inputTypes.some(inputTypeRef => inputTypeRef.namespace === "prisma" && inputTypeRef.location === "inputObjectTypes" && inputTypeRef.type === inputType.name));
  const properties = inputType.fields.map(field => generateSchemaProperty(cfg, { ...ctx, field }));
  const schema = factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("Type"),
      factory.createIdentifier("Object")
    ),
    undefined,
    [
      factory.createObjectLiteralExpression(nonNullArray(properties), true),
      factory.createObjectLiteralExpression(
        [factory.createPropertyAssignment(
          factory.createIdentifier("additionalProperties"),
          factory.createFalse()
        )],
        false
      )
    ]
  );
  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier("schema"),
        undefined,
        undefined,
        isRecursive ? wrapRecursive(schema) : schema
      )],
      ts.NodeFlags.Const
    )
  );
}
