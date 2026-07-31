import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import { scheduleLessonRemediation } from "./practiceQueue.ts";

const makeExercise = (
  id: string,
  difficulty: 1 | 2 | 3 | 4,
  variantGroup = "location-particles",
): Exercise => ({
  id,
  type: "multiple-choice",
  prompt: id,
  targetItemIds: [id.includes("de") ? "grammar-de" : "grammar-ni"],
  correctAnswers: ["に"],
  distractors: ["で"],
  variantGroup,
  difficulty,
  confusionItemIds: ["grammar-ni", "grammar-de"],
});

const failed = makeExercise("question-ni", 1);
const related = makeExercise("question-de", 1);
const harder = makeExercise("question-correction", 4);
const unrelated = makeExercise("question-word", 1, "vocabulary");
const queue = [failed, unrelated, harder, related];
const lessonExercises = [failed, related, harder, unrelated];

test("корректирующее задание ставится после двух других вопросов", () => {
  const result = scheduleLessonRemediation(queue, 0, failed, lessonExercises, []);

  assert.equal(result.queue.length, 5);
  assert.equal(result.queue[3]?.id, related.id);
  assert.equal(result.queue[3]?.sessionRole, "remediation");
  assert.equal(result.scheduledKey, "location-particles:question-de");
});

test("одно и то же корректирующее задание не планируется повторно", () => {
  const result = scheduleLessonRemediation(
    queue,
    0,
    failed,
    lessonExercises,
    ["location-particles:question-de", "location-particles:question-correction"],
  );

  assert.equal(result.scheduledKey, null);
  assert.deepEqual(result.queue, queue);
});

test("без группы вариантов очередь не меняется", () => {
  const plain: Exercise = {
    id: "plain",
    type: "text-input",
    prompt: "plain",
    targetItemIds: ["word"],
    correctAnswers: ["答え"],
  };
  const result = scheduleLessonRemediation([plain], 0, plain, [plain], []);

  assert.equal(result.scheduledKey, null);
  assert.deepEqual(result.queue, [plain]);
});
