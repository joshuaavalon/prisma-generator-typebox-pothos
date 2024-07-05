import ts from "typescript";
import { nonNullArray, required } from "#utils";
import { isUnchecked } from "./is-unchecked.js";

import type { ArrayLiteralExpression, Identifier, PropertyAssignment, StringLiteral } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { ModelConfiguration } from "#comment";

const { factory } = ts;

interface Context {
  inputType: DMMF.InputType;
  field: DMMF.SchemaArg;
  modelCfg: ModelConfiguration | null;
}


const locationPriority = ["inputObjectTypes", "enumTypes", "scalar"];

function findFieldType(cfg: Configuration, ctx: Context): ArrayLiteralExpression | Identifier | StringLiteral | null {
  const { inputType, field, modelCfg } = ctx;
  const isSelf = field.inputTypes.some(inputTypeRef => inputTypeRef.type === inputType.name);
  if (isSelf) {
    return factory.createIdentifier("graphqlName");
  }
  const inputTypeRefs = [...field.inputTypes]
    .filter(ref => cfg.enableUnchecked ?? !isUnchecked(ref.type))
    .sort((a, b) => {
      if (a.location !== b.location) {
        return locationPriority.indexOf(a.location) - locationPriority.indexOf(b.location);
      }
      if (a.isList !== b.isList) {
        return a.isList ? -1 : 1;
      }
      return 0;
    });
  const inputTypeRef = inputTypeRefs[0];
  if (!inputTypeRef) {
    return null;
  }
  let graphqlType = inputTypeRef.type;
  switch (inputTypeRef.location) {
    case "scalar":
      graphqlType = modelCfg?.fields[field.name]?.type ?? inputTypeRef.type;
      break;
    case "inputObjectTypes":
      if (inputTypeRef.type.endsWith("Filter")) {
        graphqlType = modelCfg?.fields[field.name]?.filterType ?? inputTypeRef.type;
      }
      break;
    default:
      graphqlType = inputTypeRef.type;
  }
  const fieldType = factory.createStringLiteral(graphqlType);
  return inputTypeRef.isList ? factory.createArrayLiteralExpression([fieldType], false) : fieldType;
}

/**
 * Generate Pothos field. See `@example` for generated code.
 *
 * @example
 * name: t.field({ type: "Boolean" })
 */
export function generatePothosField(cfg: Configuration, ctx: Context): PropertyAssignment | null {
  const { field, modelCfg } = ctx;
  if (modelCfg?.fields[field.name]?.ignore) {
    const { ignore } = modelCfg.fields[field.name];
    for (const ignoreEndWith of ignore) {
      if (ctx.inputType.name.endsWith(ignoreEndWith)) {
        return null;
      }
    }
  }
  const type = findFieldType(cfg, ctx);
  if (type === null) {
    return null;
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier(field.name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("t"),
        factory.createIdentifier("field")
      ),
      undefined,
      [factory.createObjectLiteralExpression(
        nonNullArray([
          factory.createPropertyAssignment(factory.createIdentifier("type"), type),
          required(cfg, !field.isNullable && field.isRequired)
        ]),
        false
      )]
    )
  );
}
