import assert from "node:assert/strict";
import test from "node:test";

import { lesson004Exercises } from "../content/lesson004.ts";
import { lesson006Exercises } from "../content/lesson006.ts";
import { lesson007Exercises } from "../content/lesson007.ts";
import { lesson010Exercises } from "../content/lesson010.ts";
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

test("past negative destination accepts omitted topic, に and a kana verb stem", () => {
  const exercise = lesson010Exercises.find(
    (item) => item.id === "exercise-kinou-gakkou-input",
  );
  assert.ok(exercise);

  const result = checkAnswer(
    "昨日学校にいきませんでした",
    exercise.correctAnswers,
    exercise.acceptableAnswers,
  );

  assert.equal(result.status, "acceptable");
  assert.equal(
    checkAnswer("いきませんでした", ["行きませんでした"]).status,
    "correct",
  );
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

test("equivalent polite i-adjective negatives normalize to the taught form", () => {
  assert.equal(
    checkAnswer("高くありません", ["高くないです"]).status,
    "correct",
  );
  assert.equal(
    checkAnswer("寒くありませんでした", ["寒くなかったです"]).status,
    "correct",
  );
  assert.equal(
    checkAnswer("よくありません", ["よくないです"]).status,
    "correct",
  );
});

test("equivalent polite noun and na-adjective negatives normalize safely", () => {
  assert.equal(
    checkAnswer("静かじゃありません", ["静かではありません"]).status,
    "correct",
  );
  assert.equal(
    checkAnswer("静かじゃないです", ["静かではありません"]).status,
    "correct",
  );
  assert.equal(
    checkAnswer("便利じゃなかったです", ["便利ではありませんでした"]).status,
    "correct",
  );
});

test("malformed adjective forms remain incorrect after normalization", () => {
  assert.equal(
    checkAnswer("高いではありません", ["高くないです"]).status,
    "incorrect",
  );
  assert.equal(
    checkAnswer("寒くないでした", ["寒くなかったです"]).status,
    "incorrect",
  );
  assert.equal(
    checkAnswer("静かくないです", ["静かではありません"]).status,
    "incorrect",
  );
});
