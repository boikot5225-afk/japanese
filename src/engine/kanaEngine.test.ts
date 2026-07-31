import assert from "node:assert/strict";
import test from "node:test";

import {
  createKanaQuestion,
  createKanaSession,
  createKnownHiraganaProgress,
  emptyKanaSkillProgress,
  getKanaMasterySummary,
  getSkillAverage,
  isKanaAnswerCorrect,
  isKanaSymbolMastered,
  updateKanaProgress,
} from "./kanaEngine.ts";
import {
  allHiraganaUnits,
  basicHiragana,
  contractedHiragana,
  voicedHiragana,
} from "../kana/hiragana.ts";

test("hiragana sets have the expected number of unique learning units", () => {
  assert.equal(basicHiragana.length, 46);
  assert.equal(voicedHiragana.length, 25);
  assert.equal(contractedHiragana.length, 33);
  assert.equal(allHiraganaUnits.length, 104);
  assert.equal(new Set(allHiraganaUnits.map((item) => item.id)).size, 104);
  assert.equal(new Set(allHiraganaUnits.map((item) => item.kana)).size, 104);
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

test("session prioritizes unseen or weaker symbols inside the selected set", () => {
  const first = voicedHiragana[0];
  const second = voicedHiragana[1];
  assert.ok(first);
  assert.ok(second);

  const mastered = {
    ...emptyKanaSkillProgress(),
    recognition: 5,
    attempts: 20,
    correct: 20,
  };
  const progress = { [first.id]: mastered };
  const session = createKanaSession("recognition", progress, 3, voicedHiragana);

  assert.equal(session.length, 3);
  assert.notEqual(session[0]?.symbolId, first.id);
  assert.equal(session[0]?.symbolId, second.id);
});

test("standard reading and keyboard input are not confused", () => {
  const wo = basicHiragana.find((item) => item.kana === "を");
  const di = voicedHiragana.find((item) => item.kana === "ぢ");
  const du = voicedHiragana.find((item) => item.kana === "づ");
  assert.ok(wo);
  assert.ok(di);
  assert.ok(du);

  const woReading = createKanaQuestion(wo, "reading", basicHiragana);
  const woTyping = createKanaQuestion(wo, "typing", basicHiragana);
  assert.equal(woReading.correctAnswer, "o");
  assert.equal(isKanaAnswerCorrect("wo", woReading), true);
  assert.equal(woTyping.correctAnswer, "wo");

  const diReading = createKanaQuestion(di, "reading", voicedHiragana);
  const diTyping = createKanaQuestion(di, "typing", voicedHiragana);
  assert.equal(diReading.correctAnswer, "ji");
  assert.equal(diTyping.correctAnswer, "di");
  assert.equal(isKanaAnswerCorrect("ji", diTyping), false);

  const duReading = createKanaQuestion(du, "reading", voicedHiragana);
  const duTyping = createKanaQuestion(du, "typing", voicedHiragana);
  assert.equal(duReading.correctAnswer, "zu");
  assert.equal(duTyping.correctAnswer, "du");
});

test("indistinguishable spellings are excluded from isolated listening", () => {
  const basicListening = createKanaSession("listening", {}, 100, basicHiragana);
  const voicedListening = createKanaSession("listening", {}, 100, voicedHiragana);

  assert.equal(basicListening.some((question) => question.symbolId === "hiragana-wo"), false);
  assert.equal(voicedListening.some((question) => question.symbolId.endsWith("-di")), false);
  assert.equal(voicedListening.some((question) => question.symbolId.endsWith("-du")), false);
  assert.equal(basicListening.length, 45);
  assert.equal(voicedListening.length, 23);
});

test("common alternative romanizations remain accepted where appropriate", () => {
  const shi = basicHiragana.find((item) => item.romaji === "shi");
  const tsu = basicHiragana.find((item) => item.romaji === "tsu");
  const sha = contractedHiragana.find((item) => item.kana === "しゃ");
  assert.ok(shi);
  assert.ok(tsu);
  assert.ok(sha);

  assert.equal(isKanaAnswerCorrect("si", createKanaQuestion(shi, "typing")), true);
  assert.equal(isKanaAnswerCorrect("tu", createKanaQuestion(tsu, "typing")), true);
  assert.equal(
    isKanaAnswerCorrect("sya", createKanaQuestion(sha, "typing", contractedHiragana)),
    true,
  );
});

test("mastery ignores an impossible isolated-listening requirement", () => {
  const di = voicedHiragana.find((item) => item.kana === "ぢ");
  assert.ok(di);
  const progress = {
    recognition: 3,
    reading: 3,
    listening: 0,
    typing: 3,
    attempts: 9,
    correct: 9,
  };
  assert.equal(isKanaSymbolMastered(progress, di), true);
  assert.equal(getSkillAverage({ [di.id]: progress }, "listening", [di]), 0);
});

test("known-hiragana profile marks the basic set mastered", () => {
  const known = createKnownHiraganaProgress();
  const basicSummary = getKanaMasterySummary(known, basicHiragana);
  const voicedSummary = getKanaMasterySummary(known, voicedHiragana);
  assert.equal(basicSummary.total, 46);
  assert.equal(basicSummary.mastered, 46);
  assert.equal(basicSummary.started, 46);
  assert.equal(voicedSummary.mastered, 0);
  assert.equal(voicedSummary.started, 0);
});
