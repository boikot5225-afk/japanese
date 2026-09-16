import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { buildKanjiProgressCatalog } from "./kanjiProgress";
import {
  buildKanjiLearnKnowledgeResults,
  buildKanjiLearnQueue,
  buildKanjiReviewQueue,
  buildKanjiStudyResult,
  countNewKanji,
  findNextKanjiCardAvailableAt,
  findNextNewKanjiId,
  findReadyKanjiCardIndex,
  gradeKanjiStudyAnswer,
  isKanjiPendingLearn,
  requeueForgottenKanjiCard,
} from "./kanjiStudySession";
import type { ReviewItem } from "./reviewEngine";

const person = n5KanjiCatalog.find((item) => item.literal === "人");
const day = n5KanjiCatalog.find((item) => item.literal === "日");
if (!person || !day) throw new Error("Test kanji are missing");

const emptyProgress = buildKanjiProgressCatalog(n5KanjiCatalog, []);

const dueReviewItem = (overrides: Partial<ReviewItem> = {}): ReviewItem => ({
  itemId: person.id,
  skill: "reading",
  exerciseId: `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
  lessonId: person.introducedInLessonId,
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

const introducedItem = (
  skill: ReviewItem["skill"],
  exerciseId: string,
): ReviewItem => ({
  ...dueReviewItem({
    skill,
    exerciseId,
    dueAt: "2026-08-03T00:00:00.000Z",
  }),
});

test("learn introduces one N5 kanji through the exact six Skritter stages", () => {
  const queue = buildKanjiLearnQueue(n5KanjiCatalog, emptyProgress);
  assert.deepEqual(
    queue.map((card) => card.part),
    [
      "preview",
      "definition",
      "reading",
      "writing-teach",
      "writing-snap",
      "writing-recall",
    ],
  );
  assert.equal(new Set(queue.map((card) => card.itemId)).size, 1);
  assert.ok(queue.every((card) => card.mode === "learn" && card.isNew));
});

test("hidden Learn knowledge results are created only for final atomic commit", () => {
  const results = buildKanjiLearnKnowledgeResults(person);
  assert.deepEqual(results.map((result) => result.exercise.skill), ["recognition", "reading"]);
  assert.ok(results.every((result) => result.status === "correct" && result.grade === 3));
});

test("partially saved 0.22.0 progress remains pending and is recoverable", () => {
  const partialItems = [
    introducedItem(
      "recognition",
      `${person.introducedInLessonId}-kanji-${person.literal}-recognition`,
    ),
    introducedItem(
      "reading",
      `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
    ),
  ];
  const progress = buildKanjiProgressCatalog(n5KanjiCatalog, partialItems);
  const personProgress = progress.find((entry) => entry.itemId === person.id);
  assert.ok(personProgress);
  assert.equal(personProgress.status, "learning");
  assert.equal(isKanjiPendingLearn(personProgress), true);
  assert.equal(findNextNewKanjiId(n5KanjiCatalog, progress), person.id);
  assert.equal(buildKanjiLearnQueue(n5KanjiCatalog, progress)[0]?.itemId, person.id);
  assert.equal(countNewKanji(n5KanjiCatalog, progress), n5KanjiCatalog.length);
});

test("a kanji leaves Learn only after meaning, reading and writing all exist", () => {
  const completeItems = [
    introducedItem(
      "recognition",
      `${person.introducedInLessonId}-kanji-${person.literal}-recognition`,
    ),
    introducedItem(
      "reading",
      `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
    ),
    introducedItem(
      "writing",
      `${person.introducedInLessonId}-kanji-${person.literal}-writing`,
    ),
  ];
  const progress = buildKanjiProgressCatalog(n5KanjiCatalog, completeItems);
  const personProgress = progress.find((entry) => entry.itemId === person.id);
  assert.ok(personProgress);
  assert.equal(isKanjiPendingLearn(personProgress), false);
  assert.notEqual(findNextNewKanjiId(n5KanjiCatalog, progress), person.id);
  assert.equal(countNewKanji(n5KanjiCatalog, progress), n5KanjiCatalog.length - 1);
});

test("auto-learn never selects the just-finished item from stale progress", () => {
  assert.notEqual(
    findNextNewKanjiId(n5KanjiCatalog, emptyProgress, person.id),
    person.id,
  );
});

test("review contains due skill cards only and never mixes new material", () => {
  const reviewItems = [dueReviewItem()];
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.equal(queue.length, 1);
  assert.equal(queue[0]?.itemId, person.id);
  assert.equal(queue[0]?.part, "reading");
  assert.equal(queue[0]?.mode, "review");
  assert.equal(queue[0]?.isNew, false);
  assert.ok(queue.every((card) => card.part !== "preview"));
});

test("review excludes future and invalid due dates", () => {
  const futureQueue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    [dueReviewItem({ dueAt: "2026-08-03T00:00:00.000Z" })],
    new Date("2026-08-02T00:00:00.000Z"),
  );
  const invalidQueue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    [dueReviewItem({ dueAt: "broken-date" })],
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.deepEqual(futureQueue, []);
  assert.deepEqual(invalidQueue, []);
});

test("deduplicates recognition and recall into one definition card", () => {
  const reviewItems = [
    dueReviewItem({ skill: "recognition" }),
    dueReviewItem({ skill: "recall", exerciseId: "recall-copy" }),
  ];
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.equal(
    queue.filter(
      (card) => card.itemId === person.id && card.part === "definition",
    ).length,
    1,
  );
});

test("review avoids adjacent parts of the same kanji when another item is ready", () => {
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    [
      dueReviewItem({ skill: "reading" }),
      dueReviewItem({ skill: "writing", exerciseId: "person-writing" }),
      dueReviewItem({
        itemId: day.id,
        skill: "reading",
        exerciseId: "day-reading",
        lessonId: day.introducedInLessonId,
      }),
    ],
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.notEqual(queue[0]?.itemId, queue[1]?.itemId);
});

test("only forgotten review cards return after the 30-second boundary", () => {
  const current = {
    id: `${person.id}:definition:review:0`,
    itemId: person.id,
    mode: "review" as const,
    part: "definition" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const remaining = [
    {
      id: `${day.id}:reading:review:0`,
      itemId: day.id,
      mode: "review" as const,
      part: "reading" as const,
      isNew: false,
      remediation: false,
      repetition: 0,
    },
  ];

  const nowMs = new Date("2026-08-02T00:00:00.000Z").getTime();
  const forgotQueue = requeueForgottenKanjiCard(remaining, current, 1, nowMs);
  assert.equal(forgotQueue.at(-1)?.itemId, person.id);
  assert.equal(forgotQueue.at(-1)?.remediation, true);
  assert.equal(forgotQueue.at(-1)?.availableAt, nowMs + 30_000);

  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 2), remaining);
  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 3), remaining);
  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 4), remaining);
});

test("forgotten cards are unavailable before 30 seconds and ready on the boundary", () => {
  const current = {
    id: `${person.id}:definition:review:0`,
    itemId: person.id,
    mode: "review" as const,
    part: "definition" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const nowMs = new Date("2026-08-02T00:00:00.000Z").getTime();
  const queue = requeueForgottenKanjiCard([], current, 1, nowMs);

  assert.equal(findReadyKanjiCardIndex(queue, nowMs + 29_999), -1);
  assert.equal(findNextKanjiCardAvailableAt(queue, nowMs + 29_999), nowMs + 30_000);
  assert.equal(findReadyKanjiCardIndex(queue, nowMs + 30_000), 0);
  assert.equal(findNextKanjiCardAvailableAt(queue, nowMs + 30_000), null);
});

test("maps Skritter grades above one to successful SRS results", () => {
  assert.equal(gradeKanjiStudyAnswer(1), "incorrect");
  assert.equal(gradeKanjiStudyAnswer(2), "acceptable");
  assert.equal(gradeKanjiStudyAnswer(3), "correct");
  assert.equal(gradeKanjiStudyAnswer(4), "correct");

  const card = {
    id: `${person.id}:reading:review:0`,
    itemId: person.id,
    mode: "review" as const,
    part: "reading" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const result = buildKanjiStudyResult(card, person, 3);
  assert.equal(result.grade, 3);
  assert.equal(result.exercise.skill, "reading");
  assert.equal(
    result.exercise.id,
    `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
  );
  assert.equal(result.status, "correct");
});
