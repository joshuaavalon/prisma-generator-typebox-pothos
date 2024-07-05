import ts from "typescript";
import { lowerFirstChar, nonNullArray } from "#utils";
import { isUnchecked } from "./is-unchecked.js";

import type { CallExpression, Expression, PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { ModelConfiguration } from "#comment";

const { factory } = ts;

interface Context {
  inputType: DMMF.InputType;
  field: DMMF.SchemaArg;
  modelCfg: ModelConfiguration | null;
}


function wrapArray(type: Expression): CallExpression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("Type"),
      factory.createIdentifier("Array")
    ),
    undefined,
    [type]
  );
}

const typeBoxType = {
  Int: "Number",
  Float: "Number",
  DateTime: "Date"
} as Record<string, string>;

function generateScalarType(inputTypeRef: DMMF.InputTypeRef): CallExpression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("Type"),
      factory.createIdentifier(typeBoxType[inputTypeRef.type] ?? inputTypeRef.type)
    ),
    undefined,
    []
  );
}

function generateEnumType(inputTypeRef: DMMF.InputTypeRef): Expression {
  const alias = lowerFirstChar(inputTypeRef.type);
  return factory.createPropertyAccessExpression(factory.createIdentifier(alias), factory.createIdentifier("schema"));
}


function generateType(inputType: DMMF.InputType, field: DMMF.SchemaArg, inputTypeRef: DMMF.InputTypeRef): Expression | null {
  let exp: Expression | null = null;
  if (inputTypeRef.location === "scalar") {
    exp = generateScalarType(inputTypeRef);
  }
  if (inputTypeRef.location === "inputObjectTypes") {
    if (inputTypeRef.type === inputType.name) {
      exp = factory.createIdentifier("self");
    } else {
      const alias = lowerFirstChar(inputTypeRef.type);
      exp = factory.createPropertyAccessExpression(factory.createIdentifier(alias), factory.createIdentifier("schema"));
    }
  }
  if (inputTypeRef.location === "enumTypes") {
    exp = generateEnumType(inputTypeRef);
  }
  if (inputTypeRef.isList && exp !== null) {
    exp = wrapArray(exp);
  }
  return exp;
}

/**
 * See `@example` for generated code.
 *
 * @example
 * equals: graphqlOptional(Type.Boolean())
 * not: graphqlOptional(self)
 */
export function generateSchemaProperty(cfg: Configuration, ctx: Context): PropertyAssignment | null {
  const { field, inputType, modelCfg } = ctx;
  if (modelCfg?.fields[field.name]?.ignore) {
    const { ignore } = modelCfg.fields[field.name];
    for (const ignoreEndWith of ignore) {
      if (ctx.inputType.name.endsWith(ignoreEndWith)) {
        return null;
      }
    }
  }
  const types = nonNullArray(field.inputTypes
    .filter(inputTypeRef => cfg.enableUnchecked ?? !isUnchecked(inputTypeRef.type))
    .map(inputTypeRef => generateType(inputType, field, inputTypeRef)));
  if (types.length <= 0) {
    return null;
  }
  const type = types.length === 1
    ? types[0]
    : factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("Type"),
        factory.createIdentifier("Union")
      ),
      undefined,
      [factory.createArrayLiteralExpression(types, types.length > 3)]
    );
  if (!field.isNullable && field.isRequired) {
    return factory.createPropertyAssignment(factory.createIdentifier(field.name), type);
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier(field.name),
    factory.createCallExpression(
      field.isNullable ? factory.createIdentifier("graphqlNullable") : factory.createIdentifier("graphqlOptional"),
      undefined,
      [type]
    )
  );
}
