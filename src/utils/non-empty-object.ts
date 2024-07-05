import ts from "typescript";
import { nonNullArray } from "./non-null-array.js";

const { factory } = ts;

import type { ObjectLiteralElementLike, ObjectLiteralExpression } from "typescript";

export function nonEmptyObject(elements: (ObjectLiteralElementLike | null) []): ObjectLiteralExpression | null {
  const nonNullElements = nonNullArray(elements);
  if (nonNullElements.length <= 0) {
    return null;
  }
  return factory.createObjectLiteralExpression(nonNullElements, nonNullElements.length > 3);
}
