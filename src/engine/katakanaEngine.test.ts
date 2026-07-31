import assert from "node:assert/strict";
import test from "node:test";

import {
  createKanaQuestion,
  createKanaSession,
  createKnownKanaProgress,
  getKanaMasterySummary,
  isKanaAnswerCorrect,
} from "./kanaEngine.ts";
import { createWordTokenPool, isKanaWordAnswerCorrect } from "./kanaWordEngine.ts";
import {
  allKatakanaUnits,
  basicKatakana,
  contractedKatakana,
  katakanaContrastUnits,
  loanKatakana,
  voicedKatakana,
} from "../kana/katakana.ts";
import { katakanaWords } from "../kana/katakanaWords.ts";

test("katakana datasets contain complete unique sets", () => {
  assert.equal(basicKatakana.length, 46);
  assert.equal(voicedKatakana.length, 25);
  assert.equal(contractedKatakana.length, 33);
  assert.equal(loanKatakana.length, 17);
  assert.equal(allKatakanaUnits.length, 121);
  assert.equal(new Set(allKatakanaUnits.map((item) => item.id)).size, 121);
  assert.equal(new Set(basicKatakana.map((item) => item.kana)).size, 46);
});

test("contrast set contains exactly シ ツ ソ ン", () => {
  assert.deepEqual(
    new Set(katakanaContrastUnits.map((item) => item.kana)),
    new Set(["シ", "ツ", "ソ", "ン"]),
  );
  const session = createKanaSession("recognition", {}, 4, katakanaContrastUnits);
  assert.equal(session.length, 4);
  session.forEach((question) => {
    assert.equal(question.options.length, 4);
  });
});

test("ヲ separates pronunciation from keyboard input and skips isolated listening", () => {
  const wo = basicKatakana.find((item) => item.kana === "ヲ");
  assert.ok(wo);
  const reading = createKanaQuestion(wo, "reading", basicKatakana);
  const typing = createKanaQuestion(wo, "typing", basicKatakana);
  assert.equal(reading.correctAnswer, "o");
  assert.equal(isKanaAnswerCorrect("wo", reading), true);
  assert.equal(typing.correctAnswer, "wo");
  assert.equal(
    createKanaSession("listening", {}, 46, basicKatakana).some(
      (question) => question.symbolId === wo.id,
    ),
    false,
  );
});

test("known-katakana profile marks all 46 basic symbols mastered", () => {
  const summary = getKanaMasterySummary(
    createKnownKanaProgress(basicKatakana),
    basicKatakana,
  );
  assert.equal(summary.total, 46);
  assert.equal(summary.mastered, 46);
});

test("katakana word content matches tokens and teaches long marks in context", () => {
  assert.equal(katakanaWords.length, 12);
  katakanaWords.forEach((word) => {
    assert.equal(word.tokens.join(""), word.kana, word.id);
    assert.equal(isKanaWordAnswerCorrect(word.tokens, word), true, word.id);
    const pool = createWordTokenPool(word);
    assert.equal(pool.length, word.tokens.length + word.distractors.length, word.id);
    assert.notEqual(pool.slice(0, word.tokens.length).join(""), word.kana, word.id);
  });

  const longWords = katakanaWords.filter((word) => word.kana.includes("ー"));
  assert.ok(longWords.length >= 6);
  longWords.forEach((word) => assert.ok(word.tokens.includes("ー"), word.id));
});

test("loanword exercises cover small ッ, ュ and ォ", () => {
  const joined = katakanaWords.map((word) => word.kana).join(" ");
  assert.match(joined, /ッ/);
  assert.match(joined, /ュ/);
  assert.match(joined, /ォ/);
  assert.ok(katakanaWords.some((word) => word.kana === "コンピューター"));
  assert.ok(katakanaWords.some((word) => word.kana === "スマートフォン"));
});
