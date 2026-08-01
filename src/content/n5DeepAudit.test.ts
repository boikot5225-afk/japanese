import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise, GrammarPoint, VocabularyItem } from "../domain/course.ts";
import { courseUnits, lessonBundles } from "./courseCatalog.ts";

const compact = (value: string): string =>
  value
    .trim()
    .normalize("NFKC")
    .toLocaleLowerCase("ru-RU")
    .replace(/[\s|_。、，！？!?.,:;「」『』（）()［\][\]{}"'«»—–-]+/gu, "");

const n5Bundles = lessonBundles.filter((bundle) => bundle.lesson.order <= 36);
const n5Units = courseUnits.filter((unit) => unit.lessons.some((lesson) => lesson.order <= 36));

const introducedAt = new Map<string, number>();
lessonBundles.forEach((bundle) => {
  [...bundle.vocabulary, ...bundle.grammar, ...bundle.sentences].forEach((item) => {
    const previous = introducedAt.get(item.id);
    if (previous === undefined || bundle.lesson.order < previous) {
      introducedAt.set(item.id, bundle.lesson.order);
    }
  });
});

const describeExercise = (exercise: Exercise): string =>
  `${exercise.id}: ${exercise.prompt} => ${exercise.correctAnswers.join(" / ")}`;

const describeItem = (lessonId: string, item: VocabularyItem | GrammarPoint): string =>
  `${lessonId}/${item.id}`;

test("N5 is a contiguous ten-unit block ending at lesson 36", () => {
  assert.deepEqual(
    n5Bundles.map((bundle) => bundle.lesson.order),
    Array.from({ length: 36 }, (_, index) => index + 1),
  );
  assert.equal(n5Units.length, 10);
  n5Units.forEach((unit) => {
    assert.equal(unit.jlptLevel, "N5", `${unit.id} is not marked N5`);
    assert.ok(unit.lessons.every((lesson) => lesson.order <= 36), `${unit.id} mixes N5 and later lessons`);
  });
});

test("N5 lessons do not label introduced vocabulary or grammar as a higher JLPT level", () => {
  const advanced = n5Bundles.flatMap((bundle) =>
    [...bundle.vocabulary, ...bundle.grammar]
      .filter((item) => item.jlptLevel && item.jlptLevel !== "N5")
      .map((item) => `${describeItem(bundle.lesson.id, item)}: ${item.jlptLevel}`),
  );

  assert.deepEqual(advanced, [], `advanced labels inside N5:\n${advanced.join("\n")}`);
});

test("N5 examples and graded targets never depend on material introduced in a future lesson", () => {
  const futureReferences: string[] = [];

  n5Bundles.forEach((bundle) => {
    const order = bundle.lesson.order;
    bundle.sentences.forEach((sentence) => {
      [...sentence.grammarIds, ...sentence.vocabularyIds].forEach((itemId) => {
        const firstOrder = introducedAt.get(itemId);
        if (firstOrder !== undefined && firstOrder > order) {
          futureReferences.push(
            `${bundle.lesson.id}/${sentence.id} references ${itemId} from lesson ${firstOrder}`,
          );
        }
      });
    });

    bundle.exercises.forEach((exercise) => {
      exercise.targetItemIds.forEach((itemId) => {
        const firstOrder = introducedAt.get(itemId);
        if (firstOrder !== undefined && firstOrder > order) {
          futureReferences.push(
            `${bundle.lesson.id}/${exercise.id} targets ${itemId} from lesson ${firstOrder}`,
          );
        }
      });
    });
  });

  assert.deepEqual(
    futureReferences,
    [],
    `future material used before introduction:\n${futureReferences.join("\n")}`,
  );
});

test("N5 example sentences are unique and have clean readable kana transcriptions", () => {
  const owners = new Map<string, string[]>();
  const malformed: string[] = [];

  n5Bundles.forEach((bundle) => {
    bundle.sentences.forEach((sentence) => {
      const key = compact(sentence.japanese);
      owners.set(key, [...(owners.get(key) ?? []), `${bundle.lesson.id}/${sentence.id}`]);

      if (!sentence.reading) {
        malformed.push(`${bundle.lesson.id}/${sentence.id}: missing reading`);
        return;
      }
      if (/[一-龯々〆ヵヶ]/u.test(sentence.reading)) {
        malformed.push(`${bundle.lesson.id}/${sentence.id}: kanji in reading: ${sentence.reading}`);
      }
      if (/[A-Za-zА-Яа-яЁё]/u.test(sentence.reading)) {
        malformed.push(`${bundle.lesson.id}/${sentence.id}: non-Japanese text in reading: ${sentence.reading}`);
      }
      const japaneseQuestion = /[？?]$/u.test(sentence.japanese.trim());
      const readingQuestion = /[？?]$/u.test(sentence.reading.trim());
      if (japaneseQuestion !== readingQuestion) {
        malformed.push(`${bundle.lesson.id}/${sentence.id}: question punctuation mismatch`);
      }
    });
  });

  const duplicates = [...owners.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([sentence, entries]) => `${sentence} => ${entries.join(", ")}`);

  assert.deepEqual(duplicates, [], `duplicate examples:\n${duplicates.join("\n")}`);
  assert.deepEqual(malformed, [], `malformed readings:\n${malformed.join("\n")}`);
});

test("N5 final sessions do not repeat the exact same task across different lessons", () => {
  const owners = new Map<string, string[]>();

  n5Bundles.forEach((bundle) => {
    bundle.exercises.forEach((exercise) => {
      const key = [
        exercise.type,
        compact(exercise.prompt),
        ...exercise.correctAnswers.map(compact).sort(),
      ].join("::");
      owners.set(key, [...(owners.get(key) ?? []), `${bundle.lesson.id}/${exercise.id}`]);
    });
  });

  const duplicates = [...owners.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => `${key} => ${entries.join(", ")}`);

  assert.deepEqual(duplicates, [], `cross-lesson duplicate tasks:\n${duplicates.join("\n")}`);
});

test("N5 exercise answer sets and target sets contain no normalized duplicates", () => {
  const malformed: string[] = [];

  n5Bundles.forEach((bundle) => {
    bundle.exercises.forEach((exercise) => {
      const correct = exercise.correctAnswers.map(compact);
      const acceptable = (exercise.acceptableAnswers ?? []).map(compact);
      const targets = exercise.targetItemIds.map(compact);
      const distractors = (exercise.distractors ?? []).map(compact);

      if (correct.length === 0 || correct.some((answer) => answer.length === 0)) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: empty correct answer`);
      }
      if (new Set(correct).size !== correct.length) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: duplicate correct answers`);
      }
      if (new Set(acceptable).size !== acceptable.length) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: duplicate acceptable answers`);
      }
      if (acceptable.some((answer) => correct.includes(answer))) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: acceptable answer repeats a correct answer`);
      }
      if (new Set(targets).size !== targets.length) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: duplicate target ids`);
      }
      if (new Set(distractors).size !== distractors.length) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: duplicate distractors`);
      }
      if ((exercise.type === "multiple-choice" || exercise.type === "listening") && distractors.length < 3) {
        malformed.push(`${bundle.lesson.id}/${exercise.id}: fewer than three distractors`);
      }
    });
  });

  assert.deepEqual(malformed, [], `malformed exercises:\n${malformed.join("\n")}`);
});

test("N5 listening audio is Japanese and never leaks Russian instructional text", () => {
  const malformed = n5Bundles.flatMap((bundle) =>
    bundle.exercises
      .filter((exercise) => exercise.type === "listening" && exercise.audioText)
      .flatMap((exercise) => {
        const audio = exercise.audioText ?? "";
        const issues: string[] = [];
        if (/[А-Яа-яЁё]/u.test(audio)) issues.push("contains Cyrillic");
        if (!/[ぁ-んァ-ヶ一-龯]/u.test(audio)) issues.push("contains no Japanese text");
        return issues.map((issue) => `${bundle.lesson.id}/${exercise.id}: ${issue}: ${audio}`);
      }),
  );

  assert.deepEqual(malformed, [], `malformed listening audio:\n${malformed.join("\n")}`);
});

test("every N5 grammar point is used in an example or directly practised", () => {
  const orphaned: string[] = [];

  n5Bundles.forEach((bundle) => {
    const sentenceGrammar = new Set(bundle.sentences.flatMap((sentence) => sentence.grammarIds));
    const exerciseTargets = new Set(bundle.exercises.flatMap((exercise) => exercise.targetItemIds));
    bundle.grammar.forEach((grammar) => {
      if (!sentenceGrammar.has(grammar.id) && !exerciseTargets.has(grammar.id)) {
        orphaned.push(`${bundle.lesson.id}/${grammar.id}`);
      }
    });
  });

  assert.deepEqual(orphaned, [], `orphaned N5 grammar:\n${orphaned.join("\n")}`);
});

test("N5 generated sessions do not expose a Japanese answer verbatim inside its own prompt", () => {
  const leaked = n5Bundles.flatMap((bundle) =>
    bundle.exercises.flatMap((exercise) => {
      const japaneseAnswers = exercise.correctAnswers
        .filter((answer) => /[ぁ-んァ-ヶ一-龯]/u.test(answer))
        .map((answer) => answer.replace(/\|/gu, ""))
        .filter((answer) => compact(answer).length >= 4);

      return japaneseAnswers
        .filter((answer) => compact(exercise.prompt).includes(compact(answer)))
        .map((answer) => `${bundle.lesson.id}/${describeExercise(exercise)} leaks ${answer}`);
    }),
  );

  assert.deepEqual(leaked, [], `answers visible in prompts:\n${leaked.join("\n")}`);
});
