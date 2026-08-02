import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import {
  buildReviewSession,
  canonicalReviewSkill,
  normalizeReviewItems,
  reviewItemKey,
  scheduleItemReview,
  upsertReviewItem,
  type ReviewItem,
} from "./reviewEngine.ts";

const now = new Date("2026-08-02T12:00:00.000Z");
const definitionExercise: Exercise = {
  id: "lesson-001-kanji-人-recognition",
  type: "multiple-choice",
  prompt: "Что означает 人?",
  targetItemIds: ["kanji-人"],
  correctAnswers: ["человек"],
  distractors: ["день", "книга", "страна"],
  skill: "recognition",
  variantGroup: "kanji-self-grade:3",
  contentKey: "kanji:人:recognition",
};

const item = (
  skill: ReviewItem["skill"],
  overrides: Partial<ReviewItem> = {},
): ReviewItem => ({
  itemId: "kanji-人",
  skill,
  exerciseId: definitionExercise.id,
  lessonId: "lesson-001",
  dueAt: "2026-08-01T00:00:00.000Z",
  intervalDays: 1,
  ease: 2.3,
  streak: 1,
  correctCount: 1,
  incorrectCount: 0,
  lapseCount: 0,
  lastStatus: "correct",
  lastAnsweredAt: "2026-07-31T00:00:00.000Z",
  ...overrides,
});

test("kanji recall is canonicalized to the single definition skill", () => {
  assert.equal(canonicalReviewSkill("kanji-人", "recall"), "recognition");
  assert.equal(canonicalReviewSkill("word-neko", "recall"), "recall");
  assert.equal(reviewItemKey(item("recognition")), reviewItemKey(item("recall")));
});

test("duplicate recognition and recall snapshots do not double-count", () => {
  const duplicate = item("recall");
  const normalized = normalizeReviewItems([item("recognition"), duplicate]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0]?.skill, "recognition");
  assert.equal(normalized[0]?.correctCount, 1);
});

test("distinct legacy definition histories merge conservatively", () => {
  const normalized = normalizeReviewItems([
    item("recognition"),
    item("recall", {
      dueAt: "2026-07-30T00:00:00.000Z",
      intervalDays: 0.5,
      correctCount: 0,
      incorrectCount: 1,
      lapseCount: 1,
      streak: 0,
      lastStatus: "incorrect",
      lastAnsweredAt: "2026-08-01T00:00:00.000Z",
    }),
  ]);
  assert.equal(normalized.length, 1);
  const merged = normalized[0];
  assert.ok(merged);
  assert.equal(merged.skill, "recognition");
  assert.equal(merged.correctCount, 1);
  assert.equal(merged.incorrectCount, 1);
  assert.equal(merged.lapseCount, 1);
  assert.equal(merged.lastStatus, "incorrect");
  assert.equal(merged.dueAt, "2026-07-30T00:00:00.000Z");
});

test("answering definition removes both old skill keys", () => {
  const previous = [item("recognition"), item("recall", { exerciseId: "legacy-recall" })];
  const scheduled = scheduleItemReview(
    previous[0],
    "kanji-人",
    "recognition",
    definitionExercise,
    "lesson-001",
    "correct",
    now,
  );
  const next = upsertReviewItem(previous, scheduled);
  assert.equal(next.length, 1);
  assert.equal(next[0]?.skill, "recognition");
});

test("review session exposes one definition card for repaired legacy data", () => {
  const session = buildReviewSession(
    [item("recognition"), item("recall", { exerciseId: "legacy-recall" })],
    new Map([["lesson-001", [definitionExercise]]]),
    [],
  );
  assert.equal(session.length, 1);
  assert.equal(session[0]?.items.length, 1);
  assert.equal(session[0]?.items[0]?.skill, "recognition");
});
