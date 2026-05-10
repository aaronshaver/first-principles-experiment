import { Ground, GroundColor, GROUND_COLOR_VALUES } from "@/domain/cells/Ground";
import { axialKey, type AxialCoordinate } from "@/domain/hex/AxialCoordinate";

export type GridCell = Ground;

export class Grid {
  private readonly cellMap: Map<string, GridCell>;

  constructor(readonly cells: GridCell[]) {
    this.cellMap = new Map(cells.map((cell) => [axialKey(cell.coordinate), cell]));
  }

  getCell(coordinate: AxialCoordinate): GridCell | undefined {
    return this.cellMap.get(axialKey(coordinate));
  }
}

export function createGroundGrid(radius: number, seed = 1): Grid {
  const random = mulberry32(seed);
  const cells: GridCell[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);

    for (let r = r1; r <= r2; r += 1) {
      cells.push(new Ground({ q, r }, pickGroundColor(random())));
    }
  }

  return new Grid(cells);
}

function pickGroundColor(value: number): GroundColor {
  return GROUND_COLOR_VALUES[Math.floor(value * GROUND_COLOR_VALUES.length)] ?? GroundColor.DarkGray;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
