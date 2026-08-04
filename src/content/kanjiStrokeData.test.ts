import assert from "node:assert/strict";
import test from "node:test";

import { lessonBundles } from "./courseCatalog.ts";
import { n5KanjiCatalog } from "./kanjiCatalog.ts";
import { kanjiStrokeDataByLiteral } from "./kanjiStrokeData.ts";

test("every catalog and lesson-required kanji has usable KanjiVG stroke data", () => {
  const required = new Set([
    ...n5KanjiCatalog.map((item) => item.literal),
    ...lessonBundles.flatMap((bundle) => (bundle.kanji ?? []).map((item) => item.literal)),
  ]);
  const missing = [...required].filter((literal) => !kanjiStrokeDataByLiteral[literal]);
  assert.deepEqual(missing, [], "missing stroke geometry: " + missing.join(" "));

  required.forEach((literal) => {
    const data = kanjiStrokeDataByLiteral[literal];
    assert.ok(data, literal + " has no stroke data");
    assert.equal(data.literal, literal);
    assert.equal(data.source, "KanjiVG");
    assert.deepEqual(data.viewBox, [0, 0, 109, 109]);
    assert.ok(data.strokes.length > 0, literal + " has no strokes");

    data.strokes.forEach((stroke, index) => {
      assert.ok(stroke.path.trim(), literal + " stroke " + (index + 1) + " has no SVG path");
      assert.ok(stroke.length > 0, literal + " stroke " + (index + 1) + " has no length");
      assert.equal(stroke.samples.length, 28);
      assert.deepEqual(stroke.samples[0], stroke.start);
      assert.deepEqual(stroke.samples.at(-1), stroke.end);
      stroke.samples.forEach((point) => {
        assert.ok(Number.isFinite(point.x));
        assert.ok(Number.isFinite(point.y));
      });
    });
  });
});
