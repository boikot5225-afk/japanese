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

test("common and input-oriented alternative romaji spellings are accepted", () => {
  const shi = basicHiragana.find((item) => item.romaji === "shi");
  const tsu = basicHiragana.find((item) => item.romaji === "tsu");
  const di = voicedHiragana.find((item) => item.kana === "ぢ");
  const du = voicedHiragana.find((item) => item.kana === "づ");
  const sha = contractedHiragana.find((item) => item.kana === "しゃ");
  assert.ok(shi);
  assert.ok(tsu);
  assert.ok(di);
  assert.ok(du);
  assert.ok(sha);

  assert.equal(isKanaAnswerCorrect("si", createKanaQuestion(shi, "typing")), true);
  assert.equal(isKanaAnswerCorrect("tu", createKanaQuestion(tsu, "typing")), true);
  assert.equal(isKanaAnswerCorrect("ji", createKanaQuestion(di, "typing", voicedHiragana)), true);
  assert.equal(isKanaAnswerCorrect("zu", createKanaQuestion(du, "typing", voicedHiragana)), true);
  assert.equal(
    isKanaAnswerCorrect("sya", createKanaQuestion(sha, "typing", contractedHiragana)),
    true,
  );
});

test("known-hiragana profile marks only the 46 basic symbols mastered", () => {
  const known = createKnownHiraganaProgress();
  const basicSummary = getKanaMasterySummary(known, basicHiragana);
  const voicedSummary = getKanaMasterySummary(known, voicedHiragana);
  assert.equal(basicSummary.total, 46);
  assert.equal(basicSummary.mastered, 46);
  assert.equal(basicSummary.started, 46);
  assert.equal(voicedSummary.mastered, 0);
  assert.equal(voicedSummary.started, 0);
});
