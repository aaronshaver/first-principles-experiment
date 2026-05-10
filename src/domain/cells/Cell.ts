import type { AxialCoordinate } from "@/domain/hex/AxialCoordinate";

export abstract class Cell {
  abstract readonly kind: string;

  protected constructor(readonly coordinate: AxialCoordinate) {}
}
