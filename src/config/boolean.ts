import { Type } from "@sinclair/typebox";


export const booleanSchema = Type.Transform(Type.Union([Type.Const("true" as const), Type.Const("false" as const)]))
  .Decode(v => v === "true")
  .Encode(v => v ? "true" : "false");
