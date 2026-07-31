import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNumberRemediation,
  buildNumberSession,
  checkNumberAnswer,
  counterToKana,
  createNumberQuestion,
  getNumberSetMastery,
  numberToKana,
  numberTrainingSets,
  updateNumberProgress,
  type NumberProgressMap,
} from "./numberTrainer.ts";

test("number readings cover regular and irregular place values", () => {
  assert.equal(numberToKana(0), "れい");
  assert.equal(numberToKana(17), "じゅうなな");
  assert.equal(numberToKana(300), "さんびゃく");
  assert.equal(numberToKana(606), "ろっぴゃくろく");
  assert.equal(numberToKana(800), "はっぴゃく");
  assert.equal(numberToKana(3000), "さんぜん");
  assert.equal(numberToKana(8000), "はっせん");
  assert.equal(numberToKana(23456), "にまんさんぜんよんひゃくごじゅうろく");
  assert.equal(numberToKana(60001), "ろくまんいち");
});

test("counter readings include important phonetic exceptions", () => {
  assert.equal(counterToKana("people", 1), "ひとり");
  assert.equal(counterToKana("people", 2), "ふたり");
  assert.equal(counterToKana("people", 14), "じゅうよにん");
  assert.equal(counterToKana("long", 1), "いっぽん");
  assert.equal(counterToKana("long", 3), "さんぼん");
  assert.equal(counterToKana("long", 20), "にじゅっぽん");
  assert.equal(counterToKana("general", 6), "ろっこ");
  assert.equal(counterToKana("hours", 4), "よじ");
  assert.equal(counterToKana("hours", 19), "じゅうくじ");
  assert.equal(counterToKana("minutes", 8), "はっぷん");
  assert.equal(counterToKana("minutes", 50), "ごじゅっぷん");
});

test("each module builds a full session without repeating a value", () => {
  const progress: NumberProgressMap = {};
  numberTrainingSets.forEach((set, index) => {
    const queue = buildNumberSession(set.id, progress, 100 + index);
    assert.equal(queue.length, 12, `${set.id} did not produce 12 questions`);
    assert.equal(new Set(queue.map((question) => question.semanticKey)).size, queue.length);
    assert.ok(queue.every((question) => question.sourceSetId === set.id));
  });
});

test("mixed practice uses multiple modules and unique meanings", () => {
  const queue = buildNumberSession("mixed", {}, 42);
  assert.equal(queue.length, 15);
  assert.ok(new Set(queue.map((question) => question.sourceSetId)).size >= 8);
  assert.equal(new Set(queue.map((question) => question.semanticKey)).size, queue.length);
});

test("answer checking accepts formatting and common variants", () => {
  const numberQuestion = createNumberQuestion("hundreds", 600, "digits-to-kana");
  assert.equal(checkNumberAnswer(numberQuestion, "ろっぴゃく。 ").correct, true);

  const peopleQuestion = createNumberQuestion("people", 17, "digits-to-kana");
  assert.equal(checkNumberAnswer(peopleQuestion, "じゅうしちにん").correct, true);

  const tenLongObjects = createNumberQuestion("long", 10, "digits-to-kana");
  assert.equal(checkNumberAnswer(tenLongObjects, "じっぽん").correct, true);

  const listeningQuestion = createNumberQuestion("man", 23456, "listening-to-digits");
  assert.equal(checkNumberAnswer(listeningQuestion, "23 456").correct, true);
  assert.equal(checkNumberAnswer(listeningQuestion, "２３４５６").correct, true);
});

test("remediation uses a different value in the same skill", () => {
  const failed = createNumberQuestion("minutes", 6, "listening-to-digits", 5);
  const remediation = buildNumberRemediation(
    failed,
    [failed.semanticKey, "minutes:value:8"],
    17,
  );
  assert.ok(remediation);
  assert.notEqual(remediation.semanticKey, failed.semanticKey);
  assert.equal(remediation.sourceSetId, failed.sourceSetId);
  assert.equal(remediation.mode, failed.mode);
  assert.equal(remediation.remediation, true);
});

test("progress remains separate for each module and skill", () => {
  const question = createNumberQuestion("hours", 4, "digits-to-kana");
  const afterCorrect = updateNumberProgress({}, question, true, new Date("2026-07-31T12:00:00Z"));
  assert.equal(getNumberSetMastery(afterCorrect, "hours"), 0.25);
  const afterError = updateNumberProgress(
    afterCorrect,
    question,
    false,
    new Date("2026-07-31T12:01:00Z"),
  );
  assert.equal(afterError["hours:digits-to-kana"]?.mastery, 0);
  assert.equal(afterError["hours:digits-to-kana"]?.lapses, 1);
  assert.equal(afterError["hours:digits-to-kana"]?.attempts, 2);
});
