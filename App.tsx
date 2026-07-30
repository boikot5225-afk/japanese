import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { courseUnits } from "./src/content/courseCatalog";
import {
  lesson001,
  lesson001Exercises,
  lesson001Grammar,
  lesson001Sentences,
  lesson001Vocabulary,
} from "./src/content/lesson001";
import type { Exercise } from "./src/domain/course";
import { checkAnswer, type AnswerCheckResult } from "./src/engine/checkAnswer";
import {
  calculateLessonResult,
  type ExerciseAttempt,
} from "./src/engine/lessonSession";

type Screen = "course" | "lesson" | "result";
type LessonStage = "theory" | "words" | "examples" | "practice";

const lessonStages: LessonStage[] = ["theory", "words", "examples", "practice"];

const stageLabels: Record<LessonStage, string> = {
  theory: "Грамматика",
  words: "Слова",
  examples: "Примеры",
  practice: "Практика",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("course");
  const [stage, setStage] = useState<LessonStage>("theory");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerCheckResult | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);

  const currentExercise = lesson001Exercises[exerciseIndex];
  const stageIndex = lessonStages.indexOf(stage);
  const lessonResult = useMemo(() => calculateLessonResult(attempts), [attempts]);

  const startLesson = () => {
    setScreen("lesson");
    setStage("theory");
    setExerciseIndex(0);
    setAnswer("");
    setSelectedTokens([]);
    setResult(null);
    setAttempts([]);
  };

  const resetExerciseInput = () => {
    setAnswer("");
    setSelectedTokens([]);
    setResult(null);
  };

  const goToNextStage = () => {
    const nextStage = lessonStages[stageIndex + 1];
    if (nextStage) {
      setStage(nextStage);
      resetExerciseInput();
    }
  };

  const goToPreviousStage = () => {
    const previousStage = lessonStages[stageIndex - 1];
    if (previousStage) {
      setStage(previousStage);
      resetExerciseInput();
    }
  };

  const finishExercise = (checkResult: AnswerCheckResult) => {
    if (!currentExercise) {
      return;
    }

    setResult(checkResult);
    setAttempts((previous) => [
      ...previous,
      { exerciseId: currentExercise.id, status: checkResult.status },
    ]);
  };

  const submitAnswer = () => {
    if (!currentExercise || result) {
      return;
    }

    const submittedAnswer =
      currentExercise.type === "sentence-builder"
        ? selectedTokens.join("|")
        : answer;

    if (submittedAnswer.trim().length === 0) {
      return;
    }

    finishExercise(
      checkAnswer(
        submittedAnswer,
        currentExercise.correctAnswers,
        currentExercise.acceptableAnswers,
      ),
    );
  };

  const chooseMultipleChoice = (choice: string) => {
    if (!currentExercise || result) {
      return;
    }

    setAnswer(choice);
    finishExercise(
      checkAnswer(
        choice,
        currentExercise.correctAnswers,
        currentExercise.acceptableAnswers,
      ),
    );
  };

  const continuePractice = () => {
    const nextExercise = lesson001Exercises[exerciseIndex + 1];
    if (nextExercise) {
      setExerciseIndex((previous) => previous + 1);
      resetExerciseInput();
      return;
    }

    setScreen("result");
  };

  const sentenceBuilderTokens = useMemo(() => {
    if (!currentExercise || currentExercise.type !== "sentence-builder") {
      return [];
    }

    const correct = currentExercise.correctAnswers[0];
    const coreTokens = correct ? correct.split("|") : [];
    return [...coreTokens, ...(currentExercise.distractors ?? [])];
  }, [currentExercise]);

  const availableBuilderTokens = sentenceBuilderTokens.filter((token) => {
    const usedCount = selectedTokens.filter((selected) => selected === token).length;
    const totalCount = sentenceBuilderTokens.filter((item) => item === token).length;
    return usedCount < totalCount;
  });

  if (screen === "course") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.eyebrow}>日本語 · Japanese</Text>
          <Text style={styles.heroTitle}>Японский с нуля до чтения</Text>
          <Text style={styles.description}>
            Последовательный курс с грамматикой, открытыми ответами и повторением,
            а не бесконечная свалка карточек.
          </Text>

          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todaySectionTitle}>Сегодня</Text>
              <Text style={styles.timeBadge}>{lesson001.estimatedMinutes} мин</Text>
            </View>
            <Text style={styles.todayTitle}>{lesson001.title}</Text>
            <Text style={styles.todayBody}>{lesson001.description}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={startLesson}>
              <Text style={styles.primaryButtonText}>Начать урок</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, styles.courseHeading]}>Курс</Text>
          {courseUnits.map((unit) => (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitLevel}>{unit.jlptLevel}</Text>
                <Text style={styles.unitCount}>{unit.lessons.length} урок</Text>
              </View>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.body}>{unit.description}</Text>
              <View style={styles.lessonRow}>
                <View style={styles.lessonNumber}>
                  <Text style={styles.lessonNumberText}>1</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson001.title}</Text>
                  <Text style={styles.lessonMeta}>Грамматика · слова · 3 упражнения</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "result") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{lessonResult.passed ? "合格" : "復習"}</Text>
          <Text style={styles.resultTitle}>
            {lessonResult.passed ? "Урок пройден" : "Нужно закрепить"}
          </Text>
          <Text style={styles.resultPercent}>{lessonResult.percent}%</Text>
          <Text style={styles.resultSummary}>
            Верных ответов: {lessonResult.correct} из {lessonResult.total}
          </Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Что изучено</Text>
            <Text style={styles.resultLine}>• тема предложения с は</Text>
            <Text style={styles.resultLine}>• вежливая связка です</Text>
            <Text style={styles.resultLine}>• первое самостоятельное предложение</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={startLesson}>
            <Text style={styles.primaryButtonText}>Пройти ещё раз</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => setScreen("course")}>
            <Text style={styles.linkButtonText}>Вернуться к курсу</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backLink} onPress={() => setScreen("course")}>
          <Text style={styles.backLinkText}>‹ К курсу</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>Урок {lesson001.order}</Text>
        <Text style={styles.title}>{lesson001.title}</Text>
        <Text style={styles.description}>{lesson001.description}</Text>

        <View style={styles.stageRow}>
          {lessonStages.map((item, index) => (
            <View key={item} style={styles.stageItem}>
              <View
                style={[
                  styles.stageDot,
                  index <= stageIndex ? styles.stageDotActive : styles.stageDotInactive,
                ]}
              />
              <Text
                style={[
                  styles.stageLabel,
                  item === stage && styles.stageLabelActive,
                ]}
              >
                {stageLabels[item]}
              </Text>
            </View>
          ))}
        </View>

        {stage === "theory" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Грамматика</Text>
            {lesson001Grammar.map((grammar) => (
              <View key={grammar.id} style={styles.card}>
                <Text style={styles.japaneseTitle}>{grammar.title}</Text>
                <Text style={styles.meaning}>{grammar.meaningRu}</Text>
                <Text style={styles.body}>{grammar.explanationRu}</Text>
                <Text style={styles.formula}>{grammar.formation.join(" · ")}</Text>
                {grammar.cautions?.map((caution) => (
                  <Text key={caution} style={styles.caution}>⚠ {caution}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {stage === "words" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Новые слова</Text>
            {lesson001Vocabulary.map((word) => (
              <View key={word.id} style={styles.wordRow}>
                <View>
                  <Text style={styles.wordWritten}>{word.writtenForm}</Text>
                  <Text style={styles.wordReading}>{word.reading}</Text>
                </View>
                <Text style={styles.wordMeaning}>{word.meaningsRu.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {stage === "examples" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Примеры</Text>
            {lesson001Sentences.map((sentence) => (
              <View key={sentence.id} style={styles.card}>
                <Text style={styles.exampleJapanese}>{sentence.japanese}</Text>
                {sentence.reading && (
                  <Text style={styles.exampleReading}>{sentence.reading}</Text>
                )}
                <Text style={styles.exampleTranslation}>{sentence.translationRu}</Text>
              </View>
            ))}
          </View>
        )}

        {stage === "practice" && currentExercise && (
          <PracticeCard
            exercise={currentExercise}
            exerciseIndex={exerciseIndex}
            exerciseCount={lesson001Exercises.length}
            answer={answer}
            selectedTokens={selectedTokens}
            availableBuilderTokens={availableBuilderTokens}
            result={result}
            onAnswerChange={(value) => {
              setAnswer(value);
              setResult(null);
            }}
            onChoice={chooseMultipleChoice}
            onToken={(token) => setSelectedTokens((previous) => [...previous, token])}
            onRemoveToken={(index) =>
              setSelectedTokens((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
            }
            onClearTokens={() => setSelectedTokens([])}
            onSubmit={submitAnswer}
            onContinue={continuePractice}
          />
        )}

        {stage !== "practice" && (
          <View style={styles.navigation}>
            <TouchableOpacity
              disabled={stageIndex === 0}
              onPress={goToPreviousStage}
              style={[styles.secondaryButton, stageIndex === 0 && styles.disabledButton]}
            >
              <Text style={styles.secondaryButtonText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButtonSmall} onPress={goToNextStage}>
              <Text style={styles.primaryButtonText}>Дальше</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface PracticeCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  exerciseCount: number;
  answer: string;
  selectedTokens: string[];
  availableBuilderTokens: string[];
  result: AnswerCheckResult | null;
  onAnswerChange: (value: string) => void;
  onChoice: (choice: string) => void;
  onToken: (token: string) => void;
  onRemoveToken: (index: number) => void;
  onClearTokens: () => void;
  onSubmit: () => void;
  onContinue: () => void;
}

function PracticeCard({
  exercise,
  exerciseIndex,
  exerciseCount,
  answer,
  selectedTokens,
  availableBuilderTokens,
  result,
  onAnswerChange,
  onChoice,
  onToken,
  onRemoveToken,
  onClearTokens,
  onSubmit,
  onContinue,
}: PracticeCardProps) {
  const choices = Array.from(
    new Set([...exercise.correctAnswers, ...(exercise.distractors ?? [])]),
  );
  const isSuccess = result?.status === "correct" || result?.status === "acceptable";

  return (
    <View style={styles.section}>
      <View style={styles.practiceHeader}>
        <Text style={styles.sectionTitle}>Практика</Text>
        <Text style={styles.exerciseCounter}>
          {exerciseIndex + 1}/{exerciseCount}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.prompt}>{exercise.prompt}</Text>

        {exercise.type === "multiple-choice" && (
          <View style={styles.choiceList}>
            {choices.map((choice) => (
              <TouchableOpacity
                key={choice}
                disabled={Boolean(result)}
                style={[
                  styles.choiceButton,
                  answer === choice && styles.choiceButtonSelected,
                ]}
                onPress={() => onChoice(choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {exercise.type === "sentence-builder" && (
          <>
            <View style={styles.builderAnswer}>
              {selectedTokens.length === 0 ? (
                <Text style={styles.builderPlaceholder}>Нажимай слова в нужном порядке</Text>
              ) : (
                selectedTokens.map((token, index) => (
                  <TouchableOpacity
                    key={`${token}-${index}`}
                    disabled={Boolean(result)}
                    style={styles.selectedToken}
                    onPress={() => onRemoveToken(index)}
                  >
                    <Text style={styles.selectedTokenText}>{token}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
            <View style={styles.tokenList}>
              {availableBuilderTokens.map((token, index) => (
                <TouchableOpacity
                  key={`${token}-${index}`}
                  disabled={Boolean(result)}
                  style={styles.tokenButton}
                  onPress={() => onToken(token)}
                >
                  <Text style={styles.tokenButtonText}>{token}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!result && selectedTokens.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={onClearTokens}>
                <Text style={styles.clearButtonText}>Очистить</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {exercise.type === "text-input" && (
          <TextInput
            value={answer}
            editable={!result}
            onChangeText={onAnswerChange}
            placeholder="Введите ответ по-японски"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        )}

        {!result && exercise.type !== "multiple-choice" && (
          <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
            <Text style={styles.primaryButtonText}>Проверить</Text>
          </TouchableOpacity>
        )}

        {result && (
          <>
            <View
              style={[
                styles.feedback,
                isSuccess ? styles.feedbackCorrect : styles.feedbackIncorrect,
              ]}
            >
              <Text style={styles.feedbackText}>{result.message}</Text>
              {exercise.explanationRu && (
                <Text style={styles.feedbackExplanation}>{exercise.explanationRu}</Text>
              )}
              {!isSuccess && (
                <Text style={styles.correctAnswer}>
                  Ответ: {exercise.correctAnswers[0] ?? "—"}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
              <Text style={styles.primaryButtonText}>
                {exerciseIndex + 1 === exerciseCount ? "Завершить урок" : "Следующее"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F3EC" },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  resultContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#9A3D3D",
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    color: "#1C1A18",
  },
  title: { marginTop: 8, fontSize: 34, lineHeight: 40, fontWeight: "800", color: "#1C1A18" },
  description: { marginTop: 10, fontSize: 16, lineHeight: 23, color: "#5D5852" },
  todayCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#26211D",
  },
  todayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  todaySectionTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  todayTitle: { marginTop: 16, fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  todayBody: { marginTop: 10, fontSize: 16, lineHeight: 23, color: "#D9D2C9" },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    fontSize: 13,
    fontWeight: "800",
    color: "#2D2824",
    backgroundColor: "#F2D9A2",
  },
  courseHeading: { marginTop: 30 },
  unitCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5DED4",
    backgroundColor: "#FFFFFF",
  },
  unitHeader: { flexDirection: "row", justifyContent: "space-between" },
  unitLevel: { fontSize: 13, fontWeight: "900", color: "#9A3D3D" },
  unitCount: { fontSize: 13, fontWeight: "700", color: "#746D65" },
  unitTitle: { marginTop: 10, fontSize: 23, fontWeight: "900", color: "#1C1A18" },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE8DF",
  },
  lessonNumber: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F0E2DE",
  },
  lessonNumberText: { fontSize: 17, fontWeight: "900", color: "#9A3D3D" },
  lessonInfo: { flex: 1, marginLeft: 13 },
  lessonTitle: { fontSize: 17, fontWeight: "800", color: "#1C1A18" },
  lessonMeta: { marginTop: 3, fontSize: 13, color: "#746D65" },
  backLink: { alignSelf: "flex-start", marginBottom: 18, paddingVertical: 4 },
  backLinkText: { fontSize: 15, fontWeight: "800", color: "#9A3D3D" },
  stageRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  stageItem: { flex: 1, alignItems: "center" },
  stageDot: { width: 9, height: 9, borderRadius: 99 },
  stageDotActive: { backgroundColor: "#B54444" },
  stageDotInactive: { backgroundColor: "#D8D0C6" },
  stageLabel: { marginTop: 6, fontSize: 11, color: "#8A8279" },
  stageLabelActive: { fontWeight: "800", color: "#433D37" },
  section: { marginTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#1C1A18" },
  card: {
    marginTop: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5DED4",
  },
  japaneseTitle: { fontSize: 24, fontWeight: "800", color: "#1C1A18" },
  meaning: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#9A3D3D" },
  body: { marginTop: 10, fontSize: 16, lineHeight: 23, color: "#5D5852" },
  formula: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#25211E",
    backgroundColor: "#F0ECE5",
  },
  caution: { marginTop: 10, fontSize: 14, lineHeight: 20, color: "#795A25" },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5DED4",
  },
  wordWritten: { fontSize: 29, fontWeight: "800", color: "#1C1A18" },
  wordReading: { marginTop: 2, fontSize: 14, color: "#746D65" },
  wordMeaning: {
    flexShrink: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    color: "#443F3A",
  },
  exampleJapanese: { fontSize: 25, fontWeight: "800", color: "#1C1A18" },
  exampleReading: { marginTop: 5, fontSize: 14, color: "#746D65" },
  exampleTranslation: { marginTop: 12, fontSize: 16, fontWeight: "700", color: "#9A3D3D" },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  secondaryButton: {
    minWidth: 100,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CFC7BC",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { fontSize: 16, fontWeight: "800", color: "#38332E" },
  disabledButton: { opacity: 0.35 },
  primaryButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#B54444",
  },
  primaryButtonSmall: {
    minWidth: 120,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#B54444",
  },
  primaryButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  practiceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  exerciseCounter: { fontSize: 14, fontWeight: "800", color: "#9A3D3D" },
  prompt: { fontSize: 19, lineHeight: 26, fontWeight: "800", color: "#1C1A18" },
  choiceList: { marginTop: 16 },
  choiceButton: {
    alignItems: "center",
    marginTop: 9,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6CEC3",
    backgroundColor: "#FCFBF8",
  },
  choiceButtonSelected: { borderColor: "#B54444", backgroundColor: "#F6E8E5" },
  choiceText: { fontSize: 22, fontWeight: "800", color: "#28231F" },
  builderAnswer: {
    minHeight: 74,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 16,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6CEC3",
    backgroundColor: "#FCFBF8",
  },
  builderPlaceholder: { fontSize: 14, color: "#8A8279" },
  selectedToken: {
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#B54444",
  },
  selectedTokenText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  tokenList: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  tokenButton: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#EEE8DF",
  },
  tokenButtonText: { fontSize: 18, fontWeight: "800", color: "#302B27" },
  clearButton: { alignSelf: "flex-start", paddingVertical: 5 },
  clearButtonText: { fontSize: 14, fontWeight: "700", color: "#9A3D3D" },
  input: {
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#CFC7BC",
    borderRadius: 14,
    fontSize: 18,
    backgroundColor: "#FCFBF8",
    color: "#1C1A18",
  },
  feedback: { marginTop: 14, padding: 14, borderRadius: 14 },
  feedbackCorrect: { backgroundColor: "#E4F2E8" },
  feedbackIncorrect: { backgroundColor: "#F7E2E0" },
  feedbackText: { fontSize: 16, fontWeight: "800", color: "#2C2824" },
  feedbackExplanation: { marginTop: 6, fontSize: 14, lineHeight: 20, color: "#514B45" },
  correctAnswer: { marginTop: 8, fontSize: 15, fontWeight: "800", color: "#7A302D" },
  resultEmoji: { fontSize: 24, fontWeight: "900", textAlign: "center", color: "#9A3D3D" },
  resultTitle: { marginTop: 12, fontSize: 35, fontWeight: "900", textAlign: "center", color: "#1C1A18" },
  resultPercent: { marginTop: 18, fontSize: 68, fontWeight: "900", textAlign: "center", color: "#B54444" },
  resultSummary: { marginTop: 4, fontSize: 17, textAlign: "center", color: "#5D5852" },
  resultCard: { marginTop: 28, padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF" },
  resultCardTitle: { fontSize: 18, fontWeight: "900", color: "#1C1A18" },
  resultLine: { marginTop: 9, fontSize: 15, lineHeight: 21, color: "#514B45" },
  linkButton: { alignItems: "center", marginTop: 14, paddingVertical: 10 },
  linkButtonText: { fontSize: 15, fontWeight: "800", color: "#9A3D3D" },
});
