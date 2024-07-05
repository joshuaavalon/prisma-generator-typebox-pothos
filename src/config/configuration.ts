import { Type } from "@sinclair/typebox";
import { scalarMappingSchema } from "./scalar-mapping.js";
import { booleanSchema } from "./boolean.js";

import type { StaticDecode } from "@sinclair/typebox";


const scalarMappingMapSchema = Type.Transform(Type.Array(scalarMappingSchema))
  .Decode(v => v.reduce<Record<string, string>>((accumulator, currentValue) => {
    const { scalarType, mappedType } = currentValue;
    return { ...accumulator, [scalarType]: mappedType };
  }, {}))
  .Encode(v => Object.entries(v).map(entry => {
    const [scalarType, mappedType] = entry;
    return { scalarType, mappedType };
  }));

export const configurationSchema = Type.Object(
  {
    typePackage: Type.String({ minLength: 1 }),
    defaultFieldNullability: booleanSchema,
    defaultInputFieldRequiredness: booleanSchema,
    enableUnchecked: Type.Optional(booleanSchema),
    scalarMappings: Type.Optional(scalarMappingMapSchema),
    authScopes: Type.Optional(Type.String({ minLength: 1 }))
  },
  { additionalProperties: false }
);

export type Configuration = StaticDecode<typeof configurationSchema>;
