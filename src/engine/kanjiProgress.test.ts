import assert from "node:assert/strict";
import test from "node:test";

import type { KanjiItem, Skill } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";
import {
  buildKanjiProgress,
  buildKanjiProgressCatalog,
} from "./kanjiProgress";
import type { ReviewItem } from "./reviewEngine";

const item: KanjiItem = {
  id: "kanji-日",
  type: "kanji",
  literal: "日",
  meaningsRu: ["день", "солнце"],
  jlptLevel: "N5",
  introducedInLessonId: "lesson-007",
  examples: [
    {
      written: "日曜日",
      reading: "にちようび",
      kanjiReading: "にち",
      meaningRu: "воскресенье",
    },
  ],
};

const reviewItem = (
  skill: Skill,
  options: Partial<ReviewItem> = {},
): ReviewItem => ({
  itemId: item.id,
  skill,
  exerciseId: `exercise-${skill}`,
  lessonId: item.introducedInLessonId,
  dueAt: "2026-08-04T08:00:00.000Z",
  intervalDays: 3,
  ease: 2.3,
  streak: 2,
  correctCount: 2,
  incorrectCount: 0,
  lapseCount: 0,
  lastStatus: "correct" as AnswerStatus,
  lastAnsweredAt: "2026-08-01T08:00:00.000Z",
  ...options,
});

test("a kanji starts new in every independent skill", () => {
  const progress = buildKanjiProgress(item, []);

  assert.equal(progress.status, "new");
  assert.equal(progress.overallMastery, 0);
  assert.equal(progress.meaning.state, "new");
  assert.equal(progress.reading.state, "new");
  assert.equal(progress.writing.state, "new");
});

test("meaning and reading progress do not fabricate writing mastery", () => {
  const progress = buildKanjiProgress(item, [
    reviewItem("recognition"),
    reviewItem("reading"),
  ]);

  assert.equal(progress.status, "learning");
  assert.ok(progress.meaning.mastery >= 70);
  assert.ok(progress.reading.mastery >= 70);
  assert.equal(progress.writing.mastery, 0);
  assert.equal(progress.writing.attempts, 0);
  assert.equal(progress.writing.state, "new");
  assert.ok(progress.overallMastery < progress.meaning.mastery);
});

test("all three skills are required for a fully reviewed kanji", () => {
  const progress = buildKanjiProgress(item, [
    reviewItem("recognition"),
    reviewItem("reading"),
    reviewItem("writing"),
  ]);

  assert.equal(progress.status, "review");
  assert.equal(progress.writing.state, "review");
  assert.ok(progress.overallMastery >= 70);
});

test("a reading failure weakens reading without erasing other skill progress", () => {
  const progress = buildKanjiProgress(item, [
    reviewItem("recognition"),
    reviewItem("writing"),
    reviewItem("reading", {
      streak: 0,
      intervalDays: 0,
      correctCount: 1,
      incorrectCount: 1,
      lapseCount: 1,
      lastStatus: "incorrect" as AnswerStatus,
      dueAt: "2026-08-02T08:00:00.000Z",
    }),
  ]);

  assert.equal(progress.status, "weak");
  assert.equal(progress.weak, true);
  assert.equal(progress.meaning.state, "review");
  assert.equal(progress.writing.state, "review");
  assert.equal(progress.reading.state, "weak");
  assert.ok(progress.meaning.mastery > progress.reading.mastery);
});

test("meaning combines recognition and recall records", () => {
  const progress = buildKanjiProgress(item, [
    reviewItem("recognition", { correctCount: 1, streak: 1, intervalDays: 1 }),
    reviewItem("recall", {
      exerciseId: "exercise-recall",
      correctCount: 2,
      streak: 2,
      intervalDays: 3,
      dueAt: "2026-08-03T08:00:00.000Z",
    }),
  ]);

  assert.equal(progress.meaning.attempts, 3);
  assert.equal(progress.meaning.correctCount, 3);
  assert.equal(progress.meaning.dueAt, "2026-08-03T08:00:00.000Z");
});

test("catalog builder keeps the original kanji order", () => {
  const second: KanjiItem = { ...item, id: "kanji-月", literal: "月" };
  const catalog = buildKanjiProgressCatalog([item, second], [reviewItem("reading")]);

  assert.deepEqual(catalog.map((entry) => entry.itemId), [item.id, second.id]);
});