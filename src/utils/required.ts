import ts from "typescript";

const { factory } = ts;

import type { PropertyAssignment } from "typescript";
import type { Configuration } from "#config";

export function required(cfg: Readonly<Configuration>, required: boolean): PropertyAssignment | null {
  const { defaultInputFieldRequiredness } = cfg;
  if (required === defaultInputFieldRequiredness) {
    return null;
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier("required"),
    required ? factory.createTrue() : factory.createFalse()
  );
}
