import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const write = (file, content) => fs.writeFileSync(path.join(root, file), content, "utf8");

const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  if (!source.includes(before)) {
    throw new Error(`Cannot apply ${label}: source fragment not found.`);
  }
  return source.replace(before, after);
};

{
  const file = "src/components/PracticeCard.tsx";
  let source = read(file);
  source = replaceOnce(
    source,
    'import { SkritterWritingPad } from "./SkritterWritingPad";',
    'import {\n  SkritterWritingPad,\n  type SkritterWritingResult,\n} from "./SkritterWritingPad";',
    "PracticeCard writing result import",
  );
  source = replaceOnce(
    source,
    '  onSubmit: () => void;\n  onContinue: () => void;',
    '  onSubmit: () => void;\n  onWritingComplete: (result: SkritterWritingResult) => void;\n  onContinue: () => void;',
    "PracticeCard writing callback prop",
  );
  source = replaceOnce(
    source,
    '  onSubmit,\n  onContinue,\n}: PracticeCardProps)',
    '  onSubmit,\n  onWritingComplete,\n  onContinue,\n}: PracticeCardProps)',
    "PracticeCard writing callback destructure",
  );
  source = replaceOnce(
    source,
    '                onComplete={(writing) =>\n                  onChoice(\n                    getHandwritingAssessmentAnswer(\n                      exercise,\n                      isPassingWritingGrade(writing.grade),\n                    ),\n                  )\n                }',
    '                onComplete={(writing) => {\n                  onWritingComplete(writing);\n                }}',
    "PracticeCard direct writing completion",
  );
  source = source.replace(
    'import { isPassingWritingGrade } from "../engine/writingSession";\n',
    "",
  );
  write(file, source);
}

{
  const file = "src/screens/TrainingScreens.tsx";
  let source = read(file);
  source = replaceOnce(
    source,
    'import { PracticeCard } from "../components/PracticeCard";\n',
    'import { PracticeCard } from "../components/PracticeCard";\nimport type { SkritterWritingResult } from "../components/SkritterWritingPad";\n',
    "TrainingScreens writing result import",
  );
  source = replaceOnce(
    source,
    '  onSubmit: () => void;\n  onContinue: () => void;',
    '  onSubmit: () => void;\n  onWritingComplete: (result: SkritterWritingResult) => void;\n  onContinue: () => void;',
    "TrainingScreens writing callback prop",
  );
  source = source.replaceAll(
    '  onSubmit,\n  onContinue,',
    '  onSubmit,\n  onWritingComplete,\n  onContinue,',
  );
  source = source.replaceAll(
    '              onSubmit={onSubmit}\n              onContinue={onContinue}',
    '              onSubmit={onSubmit}\n              onWritingComplete={onWritingComplete}\n              onContinue={onContinue}',
  );
  write(file, source);
}

{
  const file = "src/screens/CheckpointScreens.tsx";
  let source = read(file);
  source = replaceOnce(
    source,
    'import { PracticeCard } from "../components/PracticeCard";\n',
    'import { PracticeCard } from "../components/PracticeCard";\nimport type { SkritterWritingResult } from "../components/SkritterWritingPad";\n',
    "Checkpoint writing result import",
  );
  source = replaceOnce(
    source,
    '  onSubmit: () => void;\n  onContinue: () => void;',
    '  onSubmit: () => void;\n  onWritingComplete: (result: SkritterWritingResult) => void;\n  onContinue: () => void;',
    "Checkpoint writing callback prop",
  );
  source = replaceOnce(
    source,
    '  onSubmit,\n  onContinue,\n  onCourse,',
    '  onSubmit,\n  onWritingComplete,\n  onContinue,\n  onCourse,',
    "Checkpoint writing callback destructure",
  );
  source = replaceOnce(
    source,
    '            onSubmit={onSubmit}\n            onContinue={onContinue}',
    '            onSubmit={onSubmit}\n            onWritingComplete={onWritingComplete}\n            onContinue={onContinue}',
    "Checkpoint writing callback pass",
  );
  write(file, source);
}

{
  const file = "AppRoot.tsx";
  let source = read(file);
  source = replaceOnce(
    source,
    'import { scheduleWritingReview, writingGradeStatus } from "./src/engine/writingReview";\n',
    'import { scheduleWritingReview, writingGradeStatus } from "./src/engine/writingReview";\nimport type { WritingGrade } from "./src/engine/writingSession";\n',
    "AppRoot writing grade import",
  );
  source = replaceOnce(
    source,
    '    source: AttemptSource,\n    reviewQuestion?: ReviewSessionQuestion,\n  ) => {',
    '    source: AttemptSource,\n    reviewQuestion?: ReviewSessionQuestion,\n    writingGrade?: WritingGrade,\n  ) => {',
    "recordExerciseAttempt writing grade parameter",
  );
  source = replaceOnce(
    source,
    '          return upsertReviewItem(\n            items,\n            scheduleItemReview(\n              existing,\n              scheduledItem.itemId,\n              scheduledItem.skill,\n              exercise,\n              scheduledItem.lessonId,\n              checkResult.status,\n              now,\n            ),\n          );',
    '          const scheduledReview =\n            scheduledItem.skill === "writing" && writingGrade\n              ? scheduleWritingReview(\n                  existing,\n                  scheduledItem.itemId,\n                  exercise,\n                  scheduledItem.lessonId,\n                  writingGrade,\n                  now,\n                )\n              : scheduleItemReview(\n                  existing,\n                  scheduledItem.itemId,\n                  scheduledItem.skill,\n                  exercise,\n                  scheduledItem.lessonId,\n                  checkResult.status,\n                  now,\n                );\n          return upsertReviewItem(items, scheduledReview);',
    "grade-aware review scheduling",
  );
  source = replaceOnce(
    source,
    '    checkResult: AnswerCheckResult,\n  ) => {\n    const skill = inferExerciseSkill(exercise);',
    '    checkResult: AnswerCheckResult,\n    writingGrade?: WritingGrade,\n  ) => {\n    const skill = inferExerciseSkill(exercise);',
    "checkpoint writing grade parameter",
  );
  source = replaceOnce(
    source,
    '        return upsertReviewItem(\n          items,\n          scheduleItemReview(\n            existing,\n            itemId,\n            skill,\n            exercise,\n            lessonId,\n            checkResult.status,\n            now,\n          ),\n        );',
    '        const scheduledReview =\n          skill === "writing" && writingGrade\n            ? scheduleWritingReview(\n                existing,\n                itemId,\n                exercise,\n                lessonId,\n                writingGrade,\n                now,\n              )\n            : scheduleItemReview(\n                existing,\n                itemId,\n                skill,\n                exercise,\n                lessonId,\n                checkResult.status,\n                now,\n              );\n        return upsertReviewItem(items, scheduledReview);',
    "grade-aware checkpoint scheduling",
  );
  source = replaceOnce(
    source,
    '  const finishExercise = (checkResult: AnswerCheckResult) => {',
    '  const finishExercise = (\n    checkResult: AnswerCheckResult,\n    writingGrade?: WritingGrade,\n  ) => {',
    "finishExercise writing grade parameter",
  );
  source = replaceOnce(
    source,
    '      activeReviewQuestion,\n    );',
    '      activeReviewQuestion,\n      writingGrade,\n    );',
    "recordExerciseAttempt writing grade argument",
  );
  source = replaceOnce(
    source,
    '        checkResult,\n      );\n    }',
    '        checkResult,\n        writingGrade,\n      );\n    }',
    "checkpoint writing grade argument",
  );
  source = replaceOnce(
    source,
    '  const submitAnswer = () => {',
    '  const finishWritingExercise = (writing: SkritterWritingResult) => {\n    if (!currentExercise || result) return;\n    const status = writingGradeStatus(writing.grade);\n    const normalizedAnswer = currentExercise.correctAnswers[0] ?? "";\n    setAnswer(normalizedAnswer);\n    finishExercise(\n      {\n        status,\n        normalizedAnswer,\n        message:\n          status === "correct"\n            ? `Письмо принято. Оценка ${writing.grade}/4.`\n            : `Письмо нужно повторить. Оценка ${writing.grade}/4.`,\n      },\n      writing.grade,\n    );\n  };\n\n  const submitAnswer = () => {',
    "writing exercise completion handler",
  );
  source = replaceOnce(
    source,
    '        onSubmit: submitAnswer,\n      }',
    '        onSubmit: submitAnswer,\n        onWritingComplete: finishWritingExercise,\n      }',
    "common writing callback",
  );
  write(file, source);
}

console.log("Grade-aware writing integration applied.");
