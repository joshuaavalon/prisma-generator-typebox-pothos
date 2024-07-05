import ts from "typescript";
import { nonNullArray } from "#utils";

import type { Node } from "typescript";
import type { Configuration } from "#config";

const { factory, SyntaxKind } = ts;

export interface ImportMapping {
  importAlias: string;
  fileName: string;
}

export abstract class IndexMappingGenerator {
  protected readonly cfg: Configuration;
  private readonly interfaceName?: string;

  protected constructor(cfg: Configuration, interfaceName?: string) {
    this.cfg = cfg;
    this.interfaceName = interfaceName;
  }

  private generateImports(mappings: ImportMapping[]): Node[] {
    return mappings.map(mapping => factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier(mapping.importAlias))
      ),
      factory.createStringLiteral(`./${mapping.fileName}.js`)
    ));
  }

  private generateTypeImports(): Node[] {
    return [
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports([factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier("SchemaType")
          )])
        ),
        factory.createStringLiteral(this.cfg.typePackage)
      )
    ];
  }

  private generateAdd(mappings: ImportMapping[]): Node {
    return factory.createFunctionDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier("add"),
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("builder"),
        undefined,
        factory.createTypeReferenceNode(
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
        )
      )],
      factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
      factory.createBlock(
        mappings.map(mapping => factory.createExpressionStatement(factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier(mapping.importAlias),
            factory.createIdentifier("add")
          ),
          undefined,
          [factory.createIdentifier("builder")]
        ))),
        true
      )
    );
  }

  private generateType(mappings: ImportMapping[]): Node | null {
    if (!this.interfaceName) {
      return null;
    }
    return factory.createInterfaceDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(this.interfaceName),
      undefined,
      undefined,
      mappings.map(mapping => factory.createPropertySignature(
        undefined,
        factory.createComputedPropertyName(factory.createPropertyAccessExpression(
          factory.createIdentifier(mapping.importAlias),
          factory.createIdentifier("graphqlName")
        )),
        undefined,
        factory.createTypeReferenceNode(factory.createQualifiedName(
          factory.createIdentifier(mapping.importAlias),
          factory.createIdentifier("GraphqlType")
        ))
      ))
    );
  }

  protected generateIndex(mappings: ImportMapping[]): Node[] {
    return nonNullArray([
      ...this.generateImports(mappings),
      factory.createIdentifier("\n"),
      ...this.generateTypeImports(),
      factory.createIdentifier("\n"),
      this.generateAdd(mappings),
      factory.createIdentifier("\n"),
      this.generateType(mappings)
    ]);
  }

  public abstract generate(outputLocation: string): Promise<void>;
}
