import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "./kanjiCatalog.ts";

test("N5 kanji catalog has 103 unique complete entries", () => {
  assert.equal(n5KanjiCatalog.length, 103);
  assert.equal(new Set(n5KanjiCatalog.map((item) => item.id)).size, 103);
  assert.equal(new Set(n5KanjiCatalog.map((item) => item.literal)).size, 103);

  n5KanjiCatalog.forEach((item) => {
    assert.equal(item.jlptLevel, "N5");
    assert.ok(item.meaningsRu.length > 0, `${item.literal}: no meaning`);
    assert.ok(item.meaningsRu.every((meaning) => meaning.trim().length > 0));
    assert.ok(item.examples.length > 0, `${item.literal}: no example`);
    item.examples.forEach((example) => {
      assert.ok(example.written.includes(item.literal), `${item.literal}: example does not contain target`);
      assert.ok(example.reading.includes(example.kanjiReading), `${item.literal}: target reading is absent from full reading`);
      assert.ok(example.meaningRu.trim().length > 0, `${item.literal}: example has no translation`);
    });
  });
});

test("irregular native counter readings keep the full kanji portion", () => {
  const expected: Record<string, string> = {
    "九": "ここの",
    "八": "やっ",
    "七": "なな",
    "六": "むっ",
    "五": "いつ",
    "四": "よっ",
    "三": "みっ",
    "二": "ふた",
    "一": "ひと",
  };

  Object.entries(expected).forEach(([literal, reading]) => {
    const item = n5KanjiCatalog.find((candidate) => candidate.literal === literal);
    assert.ok(item, `${literal}: missing counter kanji`);
    assert.equal(item.examples[0]?.kanjiReading, reading);
  });
});
