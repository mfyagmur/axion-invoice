export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const PX_PER_MM = 3.7795
/** 1 point (typographic, as used by `font_size`) in millimeters. */
export const MM_PER_PT = 0.3528

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const

export function pageDimensionsMm(orientation: 'portrait' | 'landscape'): { width: number; height: number } {
  return orientation === 'landscape'
    ? { width: A4_HEIGHT_MM, height: A4_WIDTH_MM }
    : { width: A4_WIDTH_MM, height: A4_HEIGHT_MM }
}

export function mmToPx(mm: number, scale: number): number {
  return mm * scale
}

export function pxToMm(px: number, scale: number): number {
  return px / scale
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface SnapGuides {
  vertical: number | null
  horizontal: number | null
}

export interface SnapResult {
  x: number
  y: number
  guides: SnapGuides
}

export const SNAP_TOLERANCE_MM = 2

function edgePoints(start: number, size: number): number[] {
  return [start, start + size / 2, start + size]
}

/**
 * Finds the nearest alignment guide (another field's edge/center, or the canvas edge/center)
 * within `toleranceMm` of the dragging rect's own edges/center, and nudges the rect onto it.
 * Checked independently per axis so a horizontal and vertical guide can both apply at once.
 */
export function computeSnap(
  dragging: Rect,
  others: Rect[],
  canvasWidth: number,
  canvasHeight: number,
  toleranceMm: number = SNAP_TOLERANCE_MM,
): SnapResult {
  const xTargets = [0, canvasWidth / 2, canvasWidth, ...others.flatMap((rect) => edgePoints(rect.x, rect.width))]
  const yTargets = [0, canvasHeight / 2, canvasHeight, ...others.flatMap((rect) => edgePoints(rect.y, rect.height))]

  let bestX: { diff: number; target: number; offset: number } | null = null
  for (const point of edgePoints(dragging.x, dragging.width)) {
    for (const target of xTargets) {
      const diff = Math.abs(point - target)
      if (diff <= toleranceMm && (!bestX || diff < bestX.diff)) {
        bestX = { diff, target, offset: point - dragging.x }
      }
    }
  }

  let bestY: { diff: number; target: number; offset: number } | null = null
  for (const point of edgePoints(dragging.y, dragging.height)) {
    for (const target of yTargets) {
      const diff = Math.abs(point - target)
      if (diff <= toleranceMm && (!bestY || diff < bestY.diff)) {
        bestY = { diff, target, offset: point - dragging.y }
      }
    }
  }

  return {
    x: bestX ? bestX.target - bestX.offset : dragging.x,
    y: bestY ? bestY.target - bestY.offset : dragging.y,
    guides: {
      vertical: bestX ? bestX.target : null,
      horizontal: bestY ? bestY.target : null,
    },
  }
}
