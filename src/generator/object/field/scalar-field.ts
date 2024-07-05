import ts from "typescript";
import { nonNullArray } from "#utils";
import { nullable } from "./nullable.js";

import type { PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { FieldConfiguration } from "#comment";

const { factory } = ts;

interface Context {
  field: DMMF.Field;
  fieldCfg: FieldConfiguration;
}

export function generateScalarField(cfg: Configuration, ctx: Context): PropertyAssignment | null {
  const { scalarMappings = {} } = cfg;
  const { field, fieldCfg } = ctx;
  const name = fieldCfg.name ?? field.name;
  const fieldType = fieldCfg.type ?? scalarMappings[field.type] ?? field.type;

  const type = field.isList
    ? factory.createArrayLiteralExpression([factory.createStringLiteral(fieldType)], false)
    : factory.createStringLiteral(fieldType);
  return factory.createPropertyAssignment(
    factory.createIdentifier(name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("t"),
        factory.createIdentifier("expose")
      ),
      undefined,
      [
        factory.createStringLiteral(field.name),
        factory.createObjectLiteralExpression(
          nonNullArray([
            factory.createPropertyAssignment(factory.createIdentifier("type"), type),
            nullable(cfg, ctx),
            cfg.authScopes ? factory.createShorthandPropertyAssignment("authScopes") : null
          ]),
          false
        )
      ]
    )
  );
}
