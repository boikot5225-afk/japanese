import assert from "node:assert/strict";
import test from "node:test";

import type { KanjiStrokeVector } from "../domain/kanjiStroke";
import {
  assessKanjiStroke,
  normalizePadStroke,
  resampleStroke,
} from "./kanjiStrokeEngine";

const horizontal: KanjiStrokeVector = {
  path: "M20,50 L90,50",
  start: { x: 20, y: 50 },
  end: { x: 90, y: 50 },
  samples: Array.from({ length: 28 }, (_, index) => ({
    x: 20 + (70 * index) / 27,
    y: 50,
  })),
  length: 70,
};

const padLine = (startX: number, startY: number, endX: number, endY: number) =>
  Array.from({ length: 20 }, (_, index) => ({
    x: startX + ((endX - startX) * index) / 19,
    y: startY + ((endY - startY) * index) / 19,
  }));

test("normalizes pad coordinates into KanjiVG viewBox", () => {
  assert.deepEqual(normalizePadStroke([{ x: 100, y: 50 }], 200, 100), [
    { x: 54.5, y: 54.5 },
  ]);
});

test("resamples a stroke while preserving its endpoints", () => {
  const sampled = resampleStroke([
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 10, y: 0 },
  ], 5);
  assert.deepEqual(sampled[0], { x: 0, y: 0 });
  assert.deepEqual(sampled[4], { x: 10, y: 0 });
});

test("accepts a close stroke in the correct direction", () => {
  const result = assessKanjiStroke(
    padLine(38, 90, 166, 92),
    horizontal,
    200,
    200,
  );
  assert.equal(result.accepted, true);
  assert.equal(result.issue, null);
  assert.ok(result.score >= 70);
});

test("rejects the correct shape drawn backwards", () => {
  const result = assessKanjiStroke(
    padLine(166, 90, 38, 90),
    horizontal,
    200,
    200,
  );
  assert.equal(result.accepted, false);
  assert.equal(result.issue, "wrong-start");
});

test("rejects a stroke that starts far from the numbered point", () => {
  const result = assessKanjiStroke(
    padLine(90, 30, 170, 30),
    horizontal,
    200,
    200,
  );
  assert.equal(result.accepted, false);
  assert.equal(result.issue, "wrong-start");
});

test("rejects a distorted stroke even when endpoints are plausible", () => {
  const points = [
    { x: 38, y: 92 },
    { x: 65, y: 25 },
    { x: 100, y: 180 },
    { x: 135, y: 25 },
    { x: 166, y: 92 },
  ];
  const result = assessKanjiStroke(points, horizontal, 200, 200);
  assert.equal(result.accepted, false);
  assert.equal(result.issue, "wrong-shape");
});
