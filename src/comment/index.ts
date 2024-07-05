import { parseModel } from "./model.js";

import type { DMMF } from "@prisma/generator-helper";
import type { DocumentConfiguration } from "./type.js";

export function parseComment(document: DMMF.Document): DocumentConfiguration {
  return document.datamodel.models.reduce<DocumentConfiguration>((models, model) => ({ ...models, [model.name]: parseModel(model) }), {});
}

export * from "./type.js";
