export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const PX_PER_MM = 3.7795
/** 1 point (typographic, as used by `font_size`) in millimeters. */
export const MM_PER_PT = 0.3528

export function mmToPx(mm: number, scale: number): number {
  return mm * scale
}

export function pxToMm(px: number, scale: number): number {
  return px / scale
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
