import { Cell } from "@/domain/cells/Cell";
import type { AxialCoordinate } from "@/domain/hex/AxialCoordinate";

export enum GroundColor {
  VeryDarkGray = "very_dark_gray",
  DarkGray = "dark_gray",
  MediumGray = "medium gray"
}

export const GROUND_COLOR_VALUES = [
  GroundColor.VeryDarkGray,
  GroundColor.DarkGray,
  GroundColor.MediumGray
] as const;

export class Ground extends Cell {
  readonly kind = "ground";

  constructor(
    coordinate: AxialCoordinate,
    readonly color: GroundColor
  ) {
    super(coordinate);
  }
}
