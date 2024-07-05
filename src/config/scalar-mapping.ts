import { FormatRegistry, Type } from "@sinclair/typebox";

const regex = /^(?<scalarType>[^.\s#]+)#(?<mappedType>[^.\s#]+)$/u;
FormatRegistry.Set("scalarMapping", v => regex.test(v));

export interface ScalarMapping {
  scalarType: string;
  mappedType: string;
}

export const scalarMappingSchema = Type.Transform(Type.String({ format: "scalarMapping" }))
  .Decode(v => {
    const result = regex.exec(v);
    if (!result?.groups) {
      throw new Error("This should not happen");
    }
    const { scalarType, mappedType } = result.groups;
    return { scalarType, mappedType } as ScalarMapping;
  })
  .Encode(v => {
    const { scalarType, mappedType } = v;
    return `${scalarType}#${mappedType}`;
  });
