import { ExistsRule, VariableRule } from "./parse-rule/index.js";

import type { VariableRuleValueParser } from "./parse-rule/index.js";
import type { Optional } from "@prisma/client/runtime/library";

export interface FieldCommentParser<T> {
  (documentation: string | undefined): T;
}

export interface ParseRules {
  [key: string]: VariableRuleValueParser<unknown> | true;
}

export type ParseResult<T extends ParseRules, D extends Optional<Record<keyof T, unknown>>> = {
  [K in (Exclude<string, keyof D> & keyof T)]?: T[K] extends true ? boolean : T[K] extends VariableRuleValueParser<infer U> ? U : never
} & {
  [K in (keyof D & keyof T)]: T[K] extends true ? boolean : T[K] extends VariableRuleValueParser<infer U> ? U : never
};


export function createCommentParser<T extends ParseRules, D extends Optional<Record<keyof T, unknown>>>(prefix: string, rules: T, defaults: D): FieldCommentParser< ParseResult<T, D>> {
  return function parseComment(documentation) {
    if (!documentation) {
      return { ...defaults } as ParseResult<T, D>;
    }
    const result = { ...defaults } as Record<string, unknown>;
    // eslint-disable-next-line no-labels
    loopComment:
    for (const comment of documentation.split("\n")) {
      for (const [name, rule] of Object.entries(rules)) {
        const ruleName = `${prefix}.${name}`;
        const r = rule === true ? new ExistsRule(ruleName) : new VariableRule(ruleName, rule);
        if (r.match(comment)) {
          result[name] = r.parse(comment);
          // eslint-disable-next-line no-labels
          continue loopComment;
        }
      }
    }
    return result as ParseResult<T, D>;
  };
}
