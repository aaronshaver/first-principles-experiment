import { describe, expect, it } from "vitest";
import { axialToPixel, hexCorners } from "@/domain/hex/hexGeometry";

describe("hex geometry", () => {
  it("converts axial coordinates to pointy-top pixel centers", () => {
    expect(axialToPixel({ q: 0, r: 0 }, 10)).toEqual({ x: 0, y: 0 });
    expect(axialToPixel({ q: 0, r: 1 }, 10)).toEqual({ x: Math.sqrt(3) * 5, y: 15 });
  });

  it("builds six corners around a center", () => {
    const corners = hexCorners({ x: 10, y: 20 }, 8);

    expect(corners).toHaveLength(6);
    expect(corners[0].x).toBeCloseTo(16.928);
    expect(corners[0].y).toBeCloseTo(16);
  });
});
