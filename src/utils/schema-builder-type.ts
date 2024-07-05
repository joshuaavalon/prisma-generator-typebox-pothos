import ts from "typescript";

import type { TypeReferenceNode } from "typescript";

const { factory } = ts;

export function schemaBuilderType(): TypeReferenceNode {
  return factory.createTypeReferenceNode(
    factory.createQualifiedName(
      factory.createIdentifier("PothosSchemaTypes"),
      factory.createIdentifier("SchemaBuilder")
    ),
    [factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("PothosSchemaTypes"),
        factory.createIdentifier("ExtendDefaultTypes")
      ),
      [factory.createTypeReferenceNode(
        factory.createIdentifier("SchemaType"),
        undefined
      )]
    )]
  );
}
