export function nonNullArray<T>(values: (T | null)[]): T[] {
  return values.filter(value => value !== null) as T[];
}
