import type { Exercise } from "../domain/course";

const JAPANESE_SCRIPT_PATTERN =
  /[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9d]/;
const NON_JAPANESE_LETTER_PATTERN = /[A-Za-zА-Яа-яЁё]/;

const isJapaneseOnly = (value: string): boolean =>
  JAPANESE_SCRIPT_PATTERN.test(value) && !NON_JAPANESE_LETTER_PATTERN.test(value);

const fillPromptBlanks = (prompt: string, answer: string): string => {
  if (!prompt.includes("__")) return "";

  const promptTail = prompt.slice(prompt.lastIndexOf(":") + 1).trim();
  const blankCount = promptTail.match(/__+/g)?.length ?? 0;
  if (blankCount === 0 || !isJapaneseOnly(promptTail.replace(/_+/g, ""))) return "";

  const answerParts = answer.trim().split(/\s+/).filter(Boolean);
  if (answerParts.length !== blankCount) return "";

  let answerIndex = 0;
  const completed = promptTail.replace(/__+/g, () => answerParts[answerIndex++] ?? "");
  return isJapaneseOnly(completed) ? completed : "";
};

/**
 * Chooses useful Japanese audio for the feedback button.
 * A short answer such as a particle is inserted back into the prompt so the
 * learner hears the complete sentence instead of an isolated に／で／へ.
 */
export function getExerciseSpeechText(exercise: Exercise): string {
  if (exercise.audioText) return exercise.audioText;

  const primaryAnswer = exercise.correctAnswers[0] ?? "";
  const completedPrompt = fillPromptBlanks(exercise.prompt, primaryAnswer);
  if (completedPrompt) return completedPrompt;

  const answerWithoutBuilderSeparators = primaryAnswer.replace(/\|/g, "");
  return isJapaneseOnly(answerWithoutBuilderSeparators)
    ? answerWithoutBuilderSeparators
    : "";
}
