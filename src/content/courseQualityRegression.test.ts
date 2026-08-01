import assert from "node:assert/strict";
import test from "node:test";

import { getExerciseSpeechText } from "../audio/exerciseSpeechText.ts";
import type { Exercise } from "../domain/course.ts";
import { checkAnswer } from "../engine/checkAnswer.ts";
import { getExerciseContentKey } from "../engine/exerciseIdentity.ts";
import { lessonBundles } from "./courseCatalog.ts";
import { lesson002Exercises } from "./lesson002.ts";
import { lesson006Exercises } from "./lesson006.ts";
import { lesson016Exercises } from "./lesson016.ts";

const compact = (value: string): string =>
  value
    .trim()
    .normalize("NFKC")
    .toLocaleLowerCase("ru-RU")
    .replace(/[\s|_。、，！？!?.,:;「」『』（）()［\][\]{}"'«»—–-]+/gu, "");

const requireExercise = (
  exercises: readonly Exercise[],
  exerciseId: string,
): Exercise => {
  const exercise = exercises.find((item) => item.id === exerciseId);
  assert.ok(exercise, `${exerciseId} is missing`);
  return exercise;
};

test("final lesson sessions contain no repeated semantic or normalized tasks", () => {
  lessonBundles.forEach((bundle) => {
    const contentKeys = bundle.exercises.map(getExerciseContentKey);
    assert.equal(
      new Set(contentKeys).size,
      contentKeys.length,
      `${bundle.lesson.id} repeats a semantic content key`,
    );

    const normalizedTasks = bundle.exercises.map((exercise) =>
      [
        compact(exercise.prompt),
        ...exercise.correctAnswers.map(compact).sort(),
      ].join("::"),
    );
    assert.equal(
      new Set(normalizedTasks).size,
      normalizedTasks.length,
      `${bundle.lesson.id} repeats the same prompt and answer under another id`,
    );
  });
});

test("multiple-choice distractors stay wrong after the same normalization as user answers", () => {
  lessonBundles.forEach((bundle) => {
    bundle.exercises
      .filter(
        (exercise) =>
          exercise.type === "multiple-choice" || exercise.type === "listening",
      )
      .forEach((exercise) => {
        (exercise.distractors ?? []).forEach((distractor) => {
          const result = checkAnswer(
            distractor,
            exercise.correctAnswers,
            exercise.acceptableAnswers,
          );
          assert.equal(
            result.status,
            "incorrect",
            `${exercise.id} uses a distractor that normalizes to a valid answer: ${distractor}`,
          );
        });
      });
  });
});

test("particle feedback never speaks an isolated particle", () => {
  lessonBundles.forEach((bundle) => {
    bundle.exercises.forEach((exercise) => {
      const primaryAnswer = exercise.correctAnswers[0] ?? "";
      if (!exercise.prompt.includes("__") || compact(primaryAnswer).length > 3) return;

      const speechText = getExerciseSpeechText(exercise);
      assert.ok(speechText, `${exercise.id} has no Japanese feedback audio`);
      assert.ok(
        compact(speechText).length > compact(primaryAnswer).length,
        `${exercise.id} speaks only the short answer instead of the complete phrase`,
      );
    });
  });
});

test("listening exercises never use empty or one-character audio clips", () => {
  lessonBundles.forEach((bundle) => {
    bundle.exercises
      .filter((exercise) => exercise.type === "listening")
      .forEach((exercise) => {
        const speechText = getExerciseSpeechText(exercise);
        assert.ok(compact(speechText).length >= 2, `${exercise.id} audio is too short`);
      });
  });
});

test("sentence production accepts the taught kana reading", () => {
  lessonBundles.forEach((bundle) => {
    bundle.exercises
      .filter((exercise) => exercise.type === "text-input")
      .forEach((exercise) => {
        const sentence = bundle.sentences.find((candidate) =>
          exercise.correctAnswers.some(
            (answer) => compact(answer) === compact(candidate.japanese),
          ),
        );
        if (!sentence?.reading) return;

        const result = checkAnswer(
          sentence.reading,
          exercise.correctAnswers,
          exercise.acceptableAnswers,
        );
        assert.notEqual(
          result.status,
          "incorrect",
          `${exercise.id} rejects the kana reading ${sentence.reading}`,
        );
      });
  });
});

test("previous kore/sore context regression stays fixed", () => {
  const exercise = requireExercise(lesson002Exercises, "exercise-sore-input");
  assert.equal(
    checkAnswer(
      "それは日本語の本です",
      exercise.correctAnswers,
      exercise.acceptableAnswers,
    ).status,
    "correct",
  );
  assert.equal(
    checkAnswer(
      "これは日本語の本です",
      exercise.correctAnswers,
      exercise.acceptableAnswers,
    ).status,
    "incorrect",
  );
});

test("destination tasks continue accepting both ni and e", () => {
  const exercise = requireExercise(
    lesson006Exercises,
    "exercise-gakkou-destination-input",
  );
  ["学校に行きます", "学校へ行きます", "がっこうにいきます", "がっこうへいきます"].forEach(
    (answer) => {
      assert.notEqual(
        checkAnswer(answer, exercise.correctAnswers, exercise.acceptableAnswers).status,
        "incorrect",
        `${exercise.id} rejects valid destination answer ${answer}`,
      );
    },
  );
});

test("comparison lesson accepts natural equivalent constructions", () => {
  const hotter = requireExercise(lesson016Exercises, "exercise-haru-natsu-input");
  const choice = requireExercise(
    lesson016Exercises,
    "exercise-natsu-fuyu-question-input",
  );
  const favorite = requireExercise(
    lesson016Exercises,
    "exercise-kisetsu-ichiban-input",
  );

  assert.notEqual(
    checkAnswer("夏は春より暑いです", hotter.correctAnswers, hotter.acceptableAnswers).status,
    "incorrect",
  );
  assert.notEqual(
    checkAnswer("夏と冬ではどちらが好きですか", choice.correctAnswers, choice.acceptableAnswers).status,
    "incorrect",
  );
  assert.notEqual(
    checkAnswer(
      "季節の中では春が一番好きです",
      favorite.correctAnswers,
      favorite.acceptableAnswers,
    ).status,
    "incorrect",
  );
});

test("new lesson durations are derived from their real study and practice load", () => {
  lessonBundles
    .filter((bundle) => bundle.lesson.order >= 11)
    .forEach((bundle) => {
      assert.ok(
        bundle.lesson.estimatedMinutes >= 14 && bundle.lesson.estimatedMinutes <= 19,
        `${bundle.lesson.id} has implausible duration ${bundle.lesson.estimatedMinutes}`,
      );
    });
});

test("new course answers do not contain known malformed adjective patterns", () => {
  const teachingAnswers = lessonBundles
    .filter((bundle) => bundle.lesson.order >= 11)
    .flatMap((bundle) => [
      ...bundle.sentences.map((sentence) => sentence.japanese),
      ...bundle.exercises.flatMap((exercise) => exercise.correctAnswers),
    ])
    .join("\n");

  [
    "高いでした",
    "寒いでした",
    "いかった",
    "静かくない",
    "きれいい",
    "便利くなかった",
  ].forEach((malformed) => {
    assert.ok(!teachingAnswers.includes(malformed), `course teaches malformed ${malformed}`);
  });
});

test("kirei example chooses one contextual meaning instead of claiming both", () => {
  const lesson = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-013");
  assert.ok(lesson);
  const sentence = lesson.sentences.find(
    (item) => item.id === "sentence-kouen-kirei",
  );
  assert.ok(sentence);
  assert.equal(sentence.translationRu, "Парк красивый.");
});

test("superlative example uses the reviewed group pattern", () => {
  const lesson = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-016");
  assert.ok(lesson);
  assert.ok(
    lesson.sentences.some(
      (sentence) => sentence.japanese === "季節では春が一番好きです。",
    ),
  );
});
