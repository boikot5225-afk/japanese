import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog.ts";
import type { Exercise } from "../domain/course.ts";
import { buildKanjiReviewQueue, countDueKanjiCards } from "./kanjiStudySession.ts";
import { scheduleItemReview } from "./reviewEngine.ts";

const person = n5KanjiCatalog.find((item) => item.literal === "人");
if (!person) throw new Error("人 is missing");

const exercise: Exercise = {
  id: `${person.introducedInLessonId}-kanji-${person.literal}-recognition`,
  type: "multiple-choice",
  prompt: "Что означает 人?",
  targetItemIds: [person.id],
  correctAnswers: ["человек"],
  distractors: ["страна", "день", "книга"],
  skill: "recognition",
  variantGroup: "kanji-self-grade:1",
};

const answeredAt = new Date("2026-08-02T12:00:00.000Z");
const forgotten = scheduleItemReview(
  undefined,
  person.id,
  "recognition",
  exercise,
  person.introducedInLessonId,
  "incorrect",
  answeredAt,
);

test("forgotten kanji is hidden before the 30-second boundary", () => {
  const at29Seconds = new Date(answeredAt.getTime() + 29_000);
  assert.equal(countDueKanjiCards(n5KanjiCatalog, [forgotten], at29Seconds), 0);
  assert.deepEqual(buildKanjiReviewQueue(n5KanjiCatalog, [forgotten], at29Seconds), []);
});

test("forgotten kanji becomes due exactly at 30 seconds", () => {
  const at30Seconds = new Date(answeredAt.getTime() + 30_000);
  assert.equal(countDueKanjiCards(n5KanjiCatalog, [forgotten], at30Seconds), 1);
  const queue = buildKanjiReviewQueue(n5KanjiCatalog, [forgotten], at30Seconds);
  assert.equal(queue.length, 1);
  assert.equal(queue[0]?.itemId, person.id);
  assert.equal(queue[0]?.part, "definition");
});
