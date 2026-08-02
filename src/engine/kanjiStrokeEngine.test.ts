import assert from "node:assert/strict";
import test from "node:test";

import { kanjiStrokeDataByLiteral } from "../content/kanjiStrokeData";
import type { KanjiStrokeVector } from "../domain/kanjiStroke";
import {
  assessKanjiStroke,
  findStrokeCorners,
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

const hooked: KanjiStrokeVector = {
  path: "M25,25 L75,25 L75,80",
  start: { x: 25, y: 25 },
  end: { x: 75, y: 80 },
  samples: [
    ...Array.from({ length: 14 }, (_, index) => ({
      x: 25 + (50 * index) / 13,
      y: 25,
    })),
    ...Array.from({ length: 14 }, (_, index) => ({
      x: 75,
      y: 25 + (55 * (index + 1)) / 14,
    })),
  ],
  length: 105,
};

const complex: KanjiStrokeVector = {
  path: "M10,10 L45,10 L45,45 L80,45",
  start: { x: 10, y: 10 },
  end: { x: 80, y: 45 },
  samples: [
    ...Array.from({ length: 10 }, (_, index) => ({
      x: 10 + (35 * index) / 9,
      y: 10,
    })),
    ...Array.from({ length: 9 }, (_, index) => ({
      x: 45,
      y: 10 + (35 * (index + 1)) / 9,
    })),
    ...Array.from({ length: 9 }, (_, index) => ({
      x: 45 + (35 * (index + 1)) / 9,
      y: 45,
    })),
  ],
  length: 105,
};

const padLine = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) => Array.from({ length: 20 }, (_, index) => ({
  x: startX + ((endX - startX) * index) / 19,
  y: startY + ((endY - startY) * index) / 19,
}));

const toPad = (
  points: readonly { x: number; y: number }[],
  size = 500,
  jitter = 2,
) => points.map((point, index) => ({
  x: (point.x / 109) * size + Math.sin(index * 1.7) * jitter,
  y: (point.y / 109) * size + Math.cos(index * 1.3) * jitter,
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

test("ShortStraw keeps a straight line as two corners", () => {
  assert.equal(findStrokeCorners(horizontal.samples).length, 2);
});

test("ShortStraw detects the turn in a hooked stroke", () => {
  assert.ok(findStrokeCorners(hooked.samples).length >= 3);
});

test("accepts a natural close stroke without requiring exact endpoints", () => {
  const result = assessKanjiStroke(
    padLine(48, 226, 420, 232),
    horizontal,
    500,
    500,
  );
  assert.equal(result.accepted, true);
  assert.equal(result.issue, null);
  assert.ok(result.angleDifference < 60);
  assert.ok(result.centerDistance < 0.3);
});

test("accepts a slightly wobbled canonical stroke and snaps it later", () => {
  const result = assessKanjiStroke(toPad(horizontal.samples), horizontal, 500, 500);
  assert.equal(result.accepted, true);
});

test("rejects the correct shape drawn backwards", () => {
  const result = assessKanjiStroke(
    padLine(420, 230, 48, 230),
    horizontal,
    500,
    500,
  );
  assert.equal(result.accepted, false);
  assert.equal(result.issue, "wrong-direction");
});

test("rejects a stroke whose center is too far from the target", () => {
  const result = assessKanjiStroke(
    padLine(40, 40, 250, 40),
    horizontal,
    500,
    500,
  );
  assert.equal(result.accepted, false);
  assert.equal(result.issue, "wrong-position");
});

test("rejects a missing corner in a simple hooked stroke", () => {
  const result = assessKanjiStroke(
    padLine(115, 115, 345, 365),
    hooked,
    500,
    500,
  );
  assert.equal(result.accepted, false);
  assert.ok(["wrong-direction", "wrong-corners"].includes(result.issue ?? ""));
});

test("accepts a naturally drawn hooked stroke", () => {
  const points = [
    ...padLine(115, 115, 340, 118).slice(0, -1),
    ...padLine(340, 118, 342, 368),
  ];
  assert.equal(assessKanjiStroke(points, hooked, 500, 500).accepted, true);
});

test("does not excuse a missing complex corner when geometry also changes", () => {
  const shortcut = [
    ...padLine(46, 46, 206, 46).slice(0, -1),
    ...padLine(206, 46, 367, 207),
  ];
  const result = assessKanjiStroke(shortcut, complex, 500, 500);
  assert.equal(result.accepted, false);
});

test("accepts every canonical N5 stroke with small hand jitter", () => {
  Object.values(kanjiStrokeDataByLiteral).forEach((character) => {
    character.strokes.forEach((stroke, index) => {
      const result = assessKanjiStroke(toPad(stroke.samples, 560, 1.4), stroke, 560, 560);
      assert.equal(
        result.accepted,
        true,
        `${character.literal} stroke ${index + 1}: ${JSON.stringify(result)}`,
      );
    });
  });
});

test("all five strokes of 古 are writable without false rejection", () => {
  const old = kanjiStrokeDataByLiteral["古"];
  assert.ok(old);
  assert.equal(old.strokes.length, 5);
  old.strokes.forEach((stroke, index) => {
    const result = assessKanjiStroke(toPad(stroke.samples, 568, 1.8), stroke, 568, 568);
    assert.equal(result.accepted, true, `古 stroke ${index + 1}: ${JSON.stringify(result)}`);
  });
});
