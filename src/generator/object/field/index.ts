import { generateScalarField } from "./scalar-field.js";
import { generateObjectField } from "./object-field.js";

import type { PropertyAssignment } from "typescript";
import type { DMMF } from "@prisma/generator-helper";
import type { Configuration } from "#config";
import type { FieldConfiguration } from "#comment";

interface Context {
  field: DMMF.Field;
  fieldCfg: FieldConfiguration;
}

/**
 * Generate Prisma model field. See `@example` for generated code.
 *
 * @example
 * id: t.expose("id", { type: "UUID", authScopes })
 */
export function generateField(cfg: Configuration, ctx: Context): PropertyAssignment | null {
  const { field, fieldCfg } = ctx;
  if (fieldCfg.ignore.includes("__Object")) {
    return null;
  }
  if (field.kind === "scalar") {
    return generateScalarField(cfg, { field, fieldCfg });
  }
  if (field.kind === "object") {
    return generateObjectField(cfg, { field, fieldCfg });
  }
  return null;
}
