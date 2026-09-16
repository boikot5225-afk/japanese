import type { KanjiStrokePoint } from "../domain/kanjiStroke";

export const SKRITTER_PRESS_HOLD_MS = 300;

export type SkritterPressGesture = "single-hold" | "two-finger-hold" | null;

const distance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

export const skritterGestureAngle = (
  start: KanjiStrokePoint,
  end: KanjiStrokePoint,
): number => Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

export const skritterSwipeMinimumDistance = (canvasSize: number): number =>
  Math.min(canvasSize / 3.5, 110);

export const skritterHoldMovementTolerance = (canvasSize: number): number =>
  Math.max(canvasSize / 70, 4);

/**
 * Mirrors CanvasGL's swipe-up check. While strokes are enabled, an upward
 * gesture must exceed min(canvas / 3.5, 110px) and fall between -150° and -70°.
 * Completed cards use Skritter's more lenient 60px / -150°..-30° range.
 */
export const isSkritterSwipeUp = (
  points: readonly KanjiStrokePoint[],
  canvasSize: number,
  strokesEnabled = true,
): boolean => {
  const start = points[0];
  const end = points.at(-1);
  if (!start || !end || canvasSize <= 0) return false;

  const lineDistance = distance(start, end);
  const lineAngle = skritterGestureAngle(start, end);

  if (!strokesEnabled) {
    return lineDistance > 60 && lineAngle < -30 && lineAngle > -150;
  }

  return (
    lineDistance > skritterSwipeMinimumDistance(canvasSize) &&
    lineAngle < -70 &&
    lineAngle > -150
  );
};

/**
 * Skritter waits 300ms, then treats a nearly stationary one-finger press as a
 * single-stroke reveal and a two-or-more-finger press as reveal-all.
 */
export const getSkritterPressGesture = (
  points: readonly KanjiStrokePoint[],
  canvasSize: number,
  pointerCount: number,
  heldForMs: number,
): SkritterPressGesture => {
  if (heldForMs < SKRITTER_PRESS_HOLD_MS || canvasSize <= 0) return null;
  if (pointerCount > 1) return "two-finger-hold";

  const start = points[0];
  const end = points.at(-1);
  if (!start || !end) return null;
  return distance(start, end) < skritterHoldMovementTolerance(canvasSize)
    ? "single-hold"
    : null;
};
