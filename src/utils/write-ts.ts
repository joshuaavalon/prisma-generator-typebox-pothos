import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import ts from "typescript";

import type { Node } from "typescript";

const { factory } = ts;

export async function writeTs(outputPath: string, nodes: Node[]): Promise<void> {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const resultFile = ts.createSourceFile(
    outputPath,
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const finalNodes = nodes;
  const result = printer.printList(ts.ListFormat.MultiLine, factory.createNodeArray(finalNodes), resultFile);
  const dirPath = dirname(outputPath);
  await mkdir(dirPath, { recursive: true });
  await writeFile(outputPath, result, { encoding: "utf-8" });
}
