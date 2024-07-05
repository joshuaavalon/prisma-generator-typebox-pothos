export interface ParseRule<T> {
  match(comment: string): boolean;
  parse(comment: string): T;
}
