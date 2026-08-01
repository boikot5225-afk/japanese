import assert from "node:assert/strict";
import test from "node:test";

import { checkAnswer } from "../engine/checkAnswer.ts";
import { lessonBundles } from "./courseCatalog.ts";
import { lesson012Exercises } from "./lesson012.ts";
import { lesson013Exercises } from "./lesson013.ts";
import { lesson014Exercises } from "./lesson014.ts";

const requireBundle = (lessonId: string) => {
  const bundle = lessonBundles.find((item) => item.lesson.id === lessonId);
  assert.ok(bundle, `${lessonId} is missing`);
  return bundle;
};

const requireExercise = (
  exercises: readonly {
    id: string;
    correctAnswers: string[];
    acceptableAnswers?: string[];
  }[],
  exerciseId: string,
) => {
  const exercise = exercises.find((item) => item.id === exerciseId);
  assert.ok(exercise, `${exerciseId} is missing`);
  return exercise;
};

test("busy and genki examples use one clear contextual Russian meaning", () => {
  const lesson12 = requireBundle("lesson-012");
  const lesson13 = requireBundle("lesson-013");
  const lesson14 = requireBundle("lesson-014");

  assert.equal(
    lesson12.sentences.find((item) => item.id === "sentence-senshuu-isogashikatta")
      ?.translationRu,
    "На прошлой неделе я был занят.",
  );
  assert.equal(
    lesson13.sentences.find((item) => item.id === "sentence-tanaka-genki")
      ?.translationRu,
    "Танака хорошо себя чувствует.",
  );
  assert.equal(
    lesson14.sentences.find(
      (item) => item.id === "sentence-tanaka-genki-dewa-arimasen-deshita",
    )?.translationRu,
    "Танака плохо себя чувствовал.",
  );
});

test("kirei example does not merge beautiful and clean into one claim", () => {
  const lesson13 = requireBundle("lesson-013");
  assert.equal(
    lesson13.sentences.find((item) => item.id === "sentence-kouen-kirei")
      ?.translationRu,
    "Парк красивый.",
  );
});

test("formal i-adjective past negative remains accepted", () => {
  const exercise = requireExercise(
    lesson012Exercises,
    "exercise-kinou-samukunakatta-input",
  );
  assert.notEqual(
    checkAnswer(
      "昨日は寒くありませんでした",
      exercise.correctAnswers,
      exercise.acceptableAnswers,
    ).status,
    "incorrect",
  );
});

test("conversational na-adjective negatives remain accepted", () => {
  const present = requireExercise(
    lesson013Exercises,
    "exercise-toshokan-benri-negative-input",
  );
  const past = requireExercise(
    lesson014Exercises,
    "exercise-tanaka-genki-past-negative-input",
  );

  assert.notEqual(
    checkAnswer(
      "図書館は便利じゃないです",
      present.correctAnswers,
      present.acceptableAnswers,
    ).status,
    "incorrect",
  );
  assert.notEqual(
    checkAnswer(
      "田中さんは元気じゃなかったです",
      past.correctAnswers,
      past.acceptableAnswers,
    ).status,
    "incorrect",
  );
});
