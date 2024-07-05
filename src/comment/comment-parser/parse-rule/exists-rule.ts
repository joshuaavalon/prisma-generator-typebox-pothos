import type { ParseRule } from "./type.js";

export class ExistsRule implements ParseRule<boolean> {
  private readonly name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public match(comment: string): boolean {
    return this.name === comment.trim();
  }

  public parse(comment: string): boolean {
    return this.name === comment.trim();
  }
}
