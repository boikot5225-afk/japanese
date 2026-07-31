import assert from "node:assert/strict";
import test from "node:test";

import { lesson004Exercises } from "../content/lesson004.ts";
import { lesson006Exercises } from "../content/lesson006.ts";
import { checkAnswer } from "./checkAnswer.ts";

test("lesson 4 accepts これは学校です as a natural reading of the Russian prompt", () => {
  const exercise = lesson004Exercises.find((item) => item.id === "exercise-gakkou-input");
  assert.ok(exercise);

  const result = checkAnswer(
    "これは学校です",
    exercise.correctAnswers,
    exercise.acceptableAnswers,
  );

  assert.equal(result.status, "acceptable");
});

test("mixed kanji and hiragana remain equivalent to the taught answer", () => {
  const exercise = lesson006Exercises.find(
    (item) => item.id === "exercise-gakkou-destination-input",
  );
  assert.ok(exercise);

  const result = checkAnswer(
    "私は学校にいきます",
    exercise.correctAnswers,
    exercise.acceptableAnswers,
  );

  assert.equal(result.status, "acceptable");
});
