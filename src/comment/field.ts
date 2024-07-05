import { createCommentParser } from "./comment-parser/index.js";

import type { DMMF } from "@prisma/generator-helper";
import type { FieldConfiguration } from "./type.js";

const parseComment = createCommentParser("@Pothos", {
  ignore: v => v.split(",").map(v => v.trim()),
  select: true,
  name: v => v.trim(),
  type: v => v.trim(),
  filterType: v => v.trim()
}, { ignore: [], select: false });


export function parseField(field: DMMF.Field): FieldConfiguration {
  return parseComment(field.documentation);
}
