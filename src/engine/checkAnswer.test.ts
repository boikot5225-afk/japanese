import assert from "node:assert/strict";
import test from "node:test";

import { lesson004Exercises } from "../content/lesson004.ts";
import { lesson006Exercises } from "../content/lesson006.ts";
import { lesson007Exercises } from "../content/lesson007.ts";
import { checkAnswer } from "./checkAnswer.ts";
import {
  parseJapaneseInteger,
  replaceJapaneseNumeralsWithArabic,
} from "./japaneseNumerals.ts";

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

test("time answers accept Arabic digits and optional 今は", () => {
  const exercise = lesson007Exercises.find(
    (item) => item.id === "exercise-gogo-kuji-input",
  );
  assert.ok(exercise);

  const result = checkAnswer(
    "今は午後9時です",
    exercise.correctAnswers,
    exercise.acceptableAnswers,
  );

  assert.equal(result.status, "correct");
});

test("Japanese numeral parser handles digits, place values and 万", () => {
  assert.equal(parseJapaneseInteger("九"), 9);
  assert.equal(parseJapaneseInteger("二十四"), 24);
  assert.equal(parseJapaneseInteger("三百"), 300);
  assert.equal(parseJapaneseInteger("八千"), 8000);
  assert.equal(parseJapaneseInteger("二万三千四百五十六"), 23456);
  assert.equal(parseJapaneseInteger("二〇二四"), 2024);
  assert.equal(replaceJapaneseNumeralsWithArabic("午後九時です"), "午後9時です");
});
