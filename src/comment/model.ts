import { createCommentParser } from "./comment-parser/index.js";
import { parseField } from "./field.js";

import type { DMMF } from "@prisma/generator-helper";
import type { ModelConfiguration } from "./type.js";

const parseComment = createCommentParser("@Pothos", {
  ignore: true,
  interfaces: v => v.split(",").map(inf => inf.trim())
}, { interfaces: [], ignore: false });

export function parseModel(model: DMMF.Model): ModelConfiguration {
  const cfg = parseComment(model.documentation);
  const fields = model.fields.reduce<ModelConfiguration["fields"]>((fields, field) => ({ ...fields, [field.name]: parseField(field) }), {});
  return { ...cfg, fields };
}
