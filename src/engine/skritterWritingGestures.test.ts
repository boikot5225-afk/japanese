import assert from "node:assert/strict";
import test from "node:test";

import {
  getSkritterPressGesture,
  isSkritterSwipeUp,
  skritterHoldMovementTolerance,
  skritterSwipeMinimumDistance,
} from "./skritterWritingGestures";

const line = (startX: number, startY: number, endX: number, endY: number) => [
  { x: startX, y: startY },
  { x: endX, y: endY },
];

test("uses Skritter's clamped swipe distance on a phone-sized canvas", () => {
  assert.equal(skritterSwipeMinimumDistance(568), 110);
  assert.equal(skritterSwipeMinimumDistance(280), 80);
});

test("does not erase a short upward writing stroke", () => {
  assert.equal(isSkritterSwipeUp(line(250, 350, 250, 260), 568), false);
});

test("erases only after Skritter's full upward swipe threshold", () => {
  assert.equal(isSkritterSwipeUp(line(250, 380, 250, 269), 568), true);
  assert.equal(isSkritterSwipeUp(line(250, 380, 250, 270), 568), false);
});

test("does not treat horizontal or downward writing as erase", () => {
  assert.equal(isSkritterSwipeUp(line(100, 300, 350, 300), 568), false);
  assert.equal(isSkritterSwipeUp(line(250, 200, 250, 400), 568), false);
});

test("single-finger hold reveals one stroke after 300ms", () => {
  const tolerance = skritterHoldMovementTolerance(560);
  assert.equal(tolerance, 8);
  assert.equal(
    getSkritterPressGesture(line(200, 200, 205, 202), 560, 1, 300),
    "single-hold",
  );
  assert.equal(
    getSkritterPressGesture(line(200, 200, 205, 202), 560, 1, 299),
    null,
  );
});

test("moving while holding cancels the one-finger reveal", () => {
  assert.equal(
    getSkritterPressGesture(line(200, 200, 209, 200), 560, 1, 350),
    null,
  );
});

test("two-finger hold reveals the full character", () => {
  assert.equal(
    getSkritterPressGesture(line(200, 200, 240, 240), 560, 2, 300),
    "two-finger-hold",
  );
});
