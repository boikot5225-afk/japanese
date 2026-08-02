import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "./kanjiCatalog.ts";
import { kanjiStrokeDataByLiteral } from "./kanjiStrokeData.ts";

test("every N5 kanji has usable KanjiVG stroke data", () => {
  const literals = Object.keys(kanjiStrokeDataByLiteral);
  assert.equal(literals.length, 103);
  assert.deepEqual(
    [...literals].sort(),
    n5KanjiCatalog.map((item) => item.literal).sort(),
  );

  n5KanjiCatalog.forEach((item) => {
    const data = kanjiStrokeDataByLiteral[item.literal];
    assert.ok(data, `${item.literal} has no stroke data`);
    assert.equal(data.literal, item.literal);
    assert.equal(data.source, "KanjiVG");
    assert.deepEqual(data.viewBox, [0, 0, 109, 109]);
    assert.ok(data.strokes.length > 0, `${item.literal} has no strokes`);

    data.strokes.forEach((stroke, index) => {
      assert.ok(stroke.path.trim(), `${item.literal} stroke ${index + 1} has no SVG path`);
      assert.ok(stroke.length > 0, `${item.literal} stroke ${index + 1} has no length`);
      assert.equal(
        stroke.samples.length,
        28,
        `${item.literal} stroke ${index + 1} has incomplete samples`,
      );
      assert.deepEqual(stroke.samples[0], stroke.start);
      assert.deepEqual(stroke.samples.at(-1), stroke.end);
      stroke.samples.forEach((point) => {
        assert.ok(Number.isFinite(point.x));
        assert.ok(Number.isFinite(point.y));
      });
    });
  });
});
