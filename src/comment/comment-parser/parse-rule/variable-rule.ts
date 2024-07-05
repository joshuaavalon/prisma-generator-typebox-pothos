import type { ParseRule } from "./type.js";


export interface VariableRuleValueParser<T> {
  (value: string): T;
}

export class VariableRule<T> implements ParseRule<T> {
  private readonly name: string;
  private readonly parser: VariableRuleValueParser<T>;

  public constructor(name: string, parser: VariableRuleValueParser<T>) {
    this.name = name;
    this.parser = parser;
  }

  public match(comment: string): boolean {
    const trimmed = comment.trim();
    return trimmed.startsWith(`${this.name}(`) && trimmed.endsWith(")");
  }

  public parse(comment: string): T {
    const trimmed = comment.trim();
    const regex = new RegExp(`^${this.name}\\((?<value>.+)\\)$`, "ug");
    const result = regex.exec(trimmed);
    const value = result?.groups?.value;
    if (typeof value !== "string") {
      throw new Error("Try to parse mismatch. Please check matching before parsing.");
    }
    return this.parser(value);
  }
}
