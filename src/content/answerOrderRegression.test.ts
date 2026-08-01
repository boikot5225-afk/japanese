import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import {
  createBuilderTokenOrder,
  createChoiceOptionOrder,
  retainAvailableTokenOrder,
} from "../engine/practicePresentation.ts";

const choiceExercise: Exercise = {
  id: "choice-order-test",
  type: "multiple-choice",
  prompt: "Выбери ответ",
  targetItemIds: ["word-test"],
  correctAnswers: ["правильно"],
  distractors: ["ошибка 1", "ошибка 2", "ошибка 3"],
};

test("choice order is stable while one question remains on screen", () => {
  const first = createChoiceOptionOrder(choiceExercise, "session-a:question-1");
  const second = createChoiceOptionOrder(choiceExercise, "session-a:question-1");

  assert.deepEqual(first, second);
  assert.deepEqual(new Set(first), new Set(["правильно", "ошибка 1", "ошибка 2", "ошибка 3"]));
});

test("correct choice does not stay in the first position across attempts", () => {
  const positions = Array.from({ length: 8 }, (_, index) =>
    createChoiceOptionOrder(choiceExercise, `attempt-${index}`).indexOf("правильно"),
  );

  assert.ok(positions.some((position) => position !== 0));
  assert.ok(new Set(positions).size > 1);
});

test("sentence builder never exposes the ready answer at the start", () => {
  const correct = ["猫", "より", "犬", "のほうが", "大きい", "です"];
  const pool = [...correct, "小さい", "と"];

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const ordered = createBuilderTokenOrder(pool, correct, `builder-attempt-${attempt}`);
    assert.notEqual(ordered.slice(0, correct.length).join("|"), correct.join("|"));
    assert.deepEqual([...ordered].sort(), [...pool].sort());
  }
});

test("builder tokens keep their order after selecting and removing duplicates", () => {
  const ordered = ["は", "学校", "へ", "行き", "ます", "は"];

  assert.deepEqual(
    retainAvailableTokenOrder(ordered, ["学校", "へ", "行き", "ます", "は"]),
    ["は", "学校", "へ", "行き", "ます"],
  );
  assert.deepEqual(retainAvailableTokenOrder(ordered, ordered), ordered);
});
