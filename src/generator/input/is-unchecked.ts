export function isUnchecked(name: string): boolean {
  return /[a-z]+Unchecked[A-Z]+/ug.test(name);
}
