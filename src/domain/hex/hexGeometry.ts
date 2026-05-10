import type { AxialCoordinate } from "@/domain/hex/AxialCoordinate";

export type Point = Readonly<{
  x: number;
  y: number;
}>;

const SQRT_THREE = Math.sqrt(3);

export function axialToPixel({ q, r }: AxialCoordinate, size: number): Point {
  return {
    x: size * SQRT_THREE * (q + r / 2),
    y: size * 1.5 * r
  };
}

export function hexCorners(center: Point, size: number): Point[] {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);

    return {
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle)
    };
  });
}
