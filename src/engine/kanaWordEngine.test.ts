import assert from "node:assert/strict";
import test from "node:test";

import {
  createKanaWordSession,
  createWordTokenPool,
  getKanaWordSummary,
  isKanaWordAnswerCorrect,
  updateKanaWordProgress,
} from "./kanaWordEngine.ts";
import { kanaWords } from "../kana/kanaWords.ts";

test("word practice contains unique and internally consistent words", () => {
  assert.equal(kanaWords.length, 12);
  assert.equal(new Set(kanaWords.map((word) => word.id)).size, kanaWords.length);
  assert.equal(new Set(kanaWords.map((word) => word.kana)).size, kanaWords.length);
  kanaWords.forEach((word) => {
    assert.equal(word.tokens.join(""), word.kana, `${word.id} tokens must reproduce its kana`);
    assert.ok(word.explanationRu.length >= 40, `${word.id} needs a useful explanation`);
  });
});

test("word token pool preserves repeated kana", () => {
  const milk = kanaWords.find((word) => word.kana === "ぎゅうにゅう");
  assert.ok(milk);
  const pool = createWordTokenPool(milk);
  assert.equal(pool.filter((token) => token === "ゅ").length, 2);
  assert.equal(pool.filter((token) => token === "う").length, 2);
});

test("no word builder opens with the complete answer already laid out", () => {
  kanaWords.forEach((word) => {
    const pool = createWordTokenPool(word);
    assert.notEqual(
      pool.slice(0, word.tokens.length).join(""),
      word.kana,
      `${word.id} must not reveal its answer`,
    );
  });
});

test("builder checks the complete kana sequence", () => {
  const school = kanaWords.find((word) => word.kana === "がっこう");
  assert.ok(school);
  assert.equal(isKanaWordAnswerCorrect(["が", "っ", "こ", "う"], school), true);
  assert.equal(isKanaWordAnswerCorrect(["が", "つ", "こ", "う"], school), false);
  assert.equal(isKanaWordAnswerCorrect(["が", "こ", "っ", "う"], school), false);
});

test("incorrect words lose mastery and gain priority", () => {
  const first = kanaWords[0];
  const second = kanaWords[1];
  assert.ok(first);
  assert.ok(second);

  let progress = updateKanaWordProgress({}, first.id, true);
  progress = updateKanaWordProgress(progress, first.id, true);
  progress = updateKanaWordProgress(progress, second.id, false);
  const session = createKanaWordSession(progress, 2);

  assert.equal(session[0]?.id, second.id);
  assert.equal(progress[second.id]?.lapses, 1);
  assert.equal(progress[first.id]?.mastery, 2);
});

test("word mastery summary tracks started and mastered words", () => {
  const word = kanaWords[0];
  assert.ok(word);
  let progress = {};
  progress = updateKanaWordProgress(progress, word.id, true);
  progress = updateKanaWordProgress(progress, word.id, true);
  progress = updateKanaWordProgress(progress, word.id, true);
  const summary = getKanaWordSummary(progress);

  assert.equal(summary.total, 12);
  assert.equal(summary.started, 1);
  assert.equal(summary.mastered, 1);
});
