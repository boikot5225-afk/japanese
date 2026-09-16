import assert from "node:assert/strict";
import test from "node:test";

import { getKanjiStrokeData } from "./kanjiStrokeData.ts";
import { kanjiWritingCatalog } from "./kanjiWritingCatalog.ts";

test("writing-only catalog contains every unique writable course kanji", () => {
  assert.equal(kanjiWritingCatalog.length, 148);
  assert.equal(
    new Set(kanjiWritingCatalog.map((item) => item.literal)).size,
    kanjiWritingCatalog.length,
  );
  kanjiWritingCatalog.forEach((item) => {
    assert.ok(getKanjiStrokeData(item.literal), `missing strokes for ${item.literal}`);
  });
});

test("writing-only catalog keeps stable kanji item ids for existing progress", () => {
  kanjiWritingCatalog.forEach((item) => {
    assert.equal(item.id, `kanji-${item.literal}`);
  });
});
