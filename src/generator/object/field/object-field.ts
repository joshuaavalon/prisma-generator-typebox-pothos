import ts from "typescript";
import { nonEmptyObject, nonNullArray } from "#utils";

import type { PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { FieldConfiguration } from "#comment";

const { factory } = ts;

interface Context {
  field: DMMF.Field;
  fieldCfg: FieldConfiguration;
}


export function generateObjectField(cfg: Configuration, ctx: Context): PropertyAssignment | null {
  const { field, fieldCfg } = ctx;
  const name = fieldCfg.name ?? field.name;
  return factory.createPropertyAssignment(
    factory.createIdentifier(name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("t"),
        factory.createIdentifier("relation")
      ),
      undefined,
      nonNullArray([
        factory.createStringLiteral(field.name),
        nonEmptyObject([
          cfg.authScopes ? factory.createShorthandPropertyAssignment("authScopes") : null
        ])
      ])
    )
  );
}
