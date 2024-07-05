import ts from "typescript";

const { factory } = ts;

import type { PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";


interface Context {
  field: DMMF.Field;
}

export function nullable(cfg: Readonly<Configuration>, ctx: Readonly<Context>): PropertyAssignment | null {
  const { defaultFieldNullability } = cfg;
  const { field } = ctx;
  if (field.isRequired !== defaultFieldNullability) {
    return null;
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier("nullable"),
    field.isRequired ? factory.createFalse() : factory.createTrue()
  );
}
