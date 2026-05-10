export type AxialCoordinate = Readonly<{
  q: number;
  r: number;
}>;

export function axialKey({ q, r }: AxialCoordinate): string {
  return `${q},${r}`;
}
