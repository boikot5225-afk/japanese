import assert from "node:assert/strict";
import test from "node:test";

import {
  createKanaQuestion,
  createKanaSession,
  createKnownHiraganaProgress,
  emptyKanaSkillProgress,
  getKanaMasterySummary,
  isKanaAnswerCorrect,
  updateKanaProgress,
} from "./kanaEngine.ts";
import { basicHiragana } from "../kana/hiragana.ts";

test("basic hiragana contains 46 unique symbols", () => {
  assert.equal(basicHiragana.length, 46);
  assert.equal(new Set(basicHiragana.map((item) => item.kana)).size, 46);
  assert.equal(new Set(basicHiragana.map((item) => item.id)).size, 46);
});

test("correct and incorrect answers update only the selected skill", () => {
  const symbol = basicHiragana[0];
  assert.ok(symbol);

  const afterCorrect = updateKanaProgress({}, symbol.id, "reading", true);
  assert.equal(afterCorrect[symbol.id]?.reading, 1);
  assert.equal(afterCorrect[symbol.id]?.recognition, 0);
  assert.equal(afterCorrect[symbol.id]?.attempts, 1);
  assert.equal(afterCorrect[symbol.id]?.correct, 1);

  const afterIncorrect = updateKanaProgress(afterCorrect, symbol.id, "reading", false);
  assert.equal(afterIncorrect[symbol.id]?.reading, 0);
  assert.equal(afterIncorrect[symbol.id]?.attempts, 2);
  assert.equal(afterIncorrect[symbol.id]?.correct, 1);
});

test("session prioritizes unseen or weaker symbols", () => {
  const first = basicHiragana[0];
  const second = basicHiragana[1];
  assert.ok(first);
  assert.ok(second);

  const mastered = {
    ...emptyKanaSkillProgress(),
    recognition: 5,
    attempts: 20,
    correct: 20,
  };
  const progress = { [first.id]: mastered };
  const session = createKanaSession("recognition", progress, 3);

  assert.equal(session.length, 3);
  assert.notEqual(session[0]?.symbolId, first.id);
  assert.equal(session[0]?.symbolId, second.id);
});

test("common alternative romaji spellings are accepted", () => {
  const shi = basicHiragana.find((item) => item.romaji === "shi");
  const tsu = basicHiragana.find((item) => item.romaji === "tsu");
  assert.ok(shi);
  assert.ok(tsu);

  assert.equal(isKanaAnswerCorrect("si", createKanaQuestion(shi, "typing")), true);
  assert.equal(isKanaAnswerCorrect("tu", createKanaQuestion(tsu, "typing")), true);
});

test("known-hiragana profile marks all basic symbols mastered", () => {
  const summary = getKanaMasterySummary(createKnownHiraganaProgress());
  assert.equal(summary.total, 46);
  assert.equal(summary.mastered, 46);
  assert.equal(summary.started, 46);
});
