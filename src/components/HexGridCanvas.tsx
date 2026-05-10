"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import type { GroundColor } from "@/domain/cells/Ground";
import { createGroundGrid } from "@/domain/grid/Grid";
import { axialToPixel, hexCorners } from "@/domain/hex/hexGeometry";

const HEX_SIZE = 34;
const GRID_RADIUS = 15;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.8;
const PAN_STEP = 34;

const GROUND_PALETTE: Record<GroundColor, string> = {
  very_dark_gray: "#17191c",
  dark_gray: "#24272b",
  "medium gray": "#3a3e43"
};

type ViewTransform = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export function HexGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef<ViewTransform>({ offsetX: 0, offsetY: 0, zoom: 1 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const grid = useMemo(() => createGroundGrid(GRID_RADIUS, 20260510), []);
  const [transform, setTransform] = useState<ViewTransform>(transformRef.current);

  const updateTransform = useCallback((next: ViewTransform | ((current: ViewTransform) => ViewTransform)) => {
    setTransform((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      transformRef.current = resolved;
      return resolved;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#101113";
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width / 2 + transform.offsetX, height / 2 + transform.offsetY);
    context.scale(transform.zoom, transform.zoom);

    for (const cell of grid.cells) {
      const center = axialToPixel(cell.coordinate, HEX_SIZE);
      const corners = hexCorners(center, HEX_SIZE - 1);

      context.beginPath();
      corners.forEach((corner, index) => {
        if (index === 0) {
          context.moveTo(corner.x, corner.y);
        } else {
          context.lineTo(corner.x, corner.y);
        }
      });
      context.closePath();
      context.fillStyle = GROUND_PALETTE[cell.color];
      context.fill();
      context.strokeStyle = "#090a0b";
      context.lineWidth = 1 / transform.zoom;
      context.stroke();
    }

    context.restore();
  }, [grid, transform]);

  useEffect(() => {
    const handleResize = () => updateTransform((current) => ({ ...current }));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTransform]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyDeltas: Record<string, { x: number; y: number } | undefined> = {
        ArrowUp: { x: 0, y: PAN_STEP },
        w: { x: 0, y: PAN_STEP },
        W: { x: 0, y: PAN_STEP },
        ArrowDown: { x: 0, y: -PAN_STEP },
        s: { x: 0, y: -PAN_STEP },
        S: { x: 0, y: -PAN_STEP },
        ArrowLeft: { x: PAN_STEP, y: 0 },
        a: { x: PAN_STEP, y: 0 },
        A: { x: PAN_STEP, y: 0 },
        ArrowRight: { x: -PAN_STEP, y: 0 },
        d: { x: -PAN_STEP, y: 0 },
        D: { x: -PAN_STEP, y: 0 }
      };
      const delta = keyDeltas[event.key];

      if (!delta) {
        return;
      }

      event.preventDefault();
      updateTransform((current) => ({
        ...current,
        offsetX: current.offsetX + delta.x,
        offsetY: current.offsetY + delta.y
      }));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateTransform]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };

    updateTransform((current) => ({
      ...current,
      offsetX: current.offsetX + dx,
      offsetY: current.offsetY + dy
    }));
  };

  const stopDragging = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const current = transformRef.current;
    const nextZoom = clamp(current.zoom * Math.exp(-event.deltaY * 0.001), MIN_ZOOM, MAX_ZOOM);
    const cursorX = event.clientX - rect.left - rect.width / 2;
    const cursorY = event.clientY - rect.top - rect.height / 2;
    const worldX = (cursorX - current.offsetX) / current.zoom;
    const worldY = (cursorY - current.offsetY) / current.zoom;

    updateTransform({
      zoom: nextZoom,
      offsetX: cursorX - worldX * nextZoom,
      offsetY: cursorY - worldY * nextZoom
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="hex-grid-canvas"
      aria-label="Hex grid"
      role="img"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onWheel={handleWheel}
    />
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
