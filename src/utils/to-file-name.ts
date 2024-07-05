export function toFileName(input: string): string {
  return input.split(/\.?(?=[A-Z])/u)
    .join("-")
    .toLowerCase();
}
