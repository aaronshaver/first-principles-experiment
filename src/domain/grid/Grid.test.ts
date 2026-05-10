import { describe, expect, it } from "vitest";
import { Ground, GroundColor, GROUND_COLOR_VALUES } from "@/domain/cells/Ground";
import { createGroundGrid, Grid } from "@/domain/grid/Grid";

describe("Grid", () => {
  it("stores cells by axial coordinate", () => {
    const ground = new Ground({ q: 1, r: -1 }, GroundColor.DarkGray);
    const grid = new Grid([ground]);

    expect(grid.getCell({ q: 1, r: -1 })).toBe(ground);
    expect(grid.getCell({ q: 0, r: 0 })).toBeUndefined();
  });

  it("creates the expected number of cells for a hex radius", () => {
    expect(createGroundGrid(0).cells).toHaveLength(1);
    expect(createGroundGrid(2).cells).toHaveLength(19);
  });

  it("assigns persistent seeded ground colors", () => {
    const first = createGroundGrid(3, 42).cells.map((cell) => cell.color);
    const second = createGroundGrid(3, 42).cells.map((cell) => cell.color);

    expect(second).toEqual(first);
    expect(new Set(first)).toEqual(new Set(GROUND_COLOR_VALUES));
  });
});
