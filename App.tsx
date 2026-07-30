import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import { findLessonBundle, lessonBundles } from "./src/content/courseCatalog";
import type { LessonBundle } from "./src/content/lessonBundle";
import type { Exercise } from "./src/domain/course";
import { checkAnswer, type AnswerCheckResult } from "./src/engine/checkAnswer";
import { calculateLessonResult, type ExerciseAttempt } from "./src/engine/lessonSession";
import {
  createAttemptLogEntry,
  getDueReviewItems,
  getNextReviewAt,
  getWeakTargetIds,
  isSuccessfulStatus,
  scheduleExerciseReview,
  upsertReviewItem,
  type AttemptLogEntry,
  type AttemptSource,
  type ReviewItem,
} from "./src/engine/reviewEngine";
import { CourseScreen } from "./src/screens/CourseScreen";
import { LessonResultScreen, ReviewResultScreen } from "./src/screens/ResultScreens";
import { LessonScreen, ReviewScreen, type LessonStage } from "./src/screens/TrainingScreens";
import { loadCourseProgress, saveCourseProgress } from "./src/storage/progressStorage";
import { styles } from "./src/theme/appStyles";

type Screen = "course" | "lesson" | "result" | "review" | "review-result";
const lessonStages: LessonStage[] = ["theory", "words", "examples", "practice"];
const initialBundle: LessonBundle = lessonBundles[0] ?? (() => {
  throw new Error("В курсе нет ни одного урока.");
})();

const formatReviewDate = (value: string | null): string => {
  if (!value) return "после первого пройденного задания";
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
  if (sameDay(date, today)) {
    return `сегодня в ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (sameDay(date, tomorrow)) return "завтра";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("course");
  const [activeBundle, setActiveBundle] = useState<LessonBundle>(initialBundle);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [attemptHistory, setAttemptHistory] = useState<AttemptLogEntry[]>([]);
  const [progressHydrated, setProgressHydrated] = useState(false);
  const [stage, setStage] = useState<LessonStage>("theory");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerCheckResult | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAttempts, setReviewAttempts] = useState<ExerciseAttempt[]>([]);
  const [requeuedExerciseIds, setRequeuedExerciseIds] = useState<string[]>([]);

  const lessonExercise = activeBundle.exercises[exerciseIndex];
  const activeReviewItem = reviewQueue[reviewIndex];
  const activeReviewBundle = activeReviewItem ? findLessonBundle(activeReviewItem.lessonId) : undefined;
  const reviewExercise = activeReviewBundle?.exercises.find(
    (exercise) => exercise.id === activeReviewItem?.exerciseId,
  );
  const currentExercise = screen === "review" ? reviewExercise : lessonExercise;
  const lessonResult = useMemo(() => calculateLessonResult(attempts), [attempts]);
  const reviewResult = useMemo(() => calculateLessonResult(reviewAttempts), [reviewAttempts]);
  const activeBundleIndex = lessonBundles.findIndex(
    (bundle) => bundle.lesson.id === activeBundle.lesson.id,
  );
  const nextBundle = lessonBundles[activeBundleIndex + 1];
  const todayBundle =
    lessonBundles.find((bundle) => !completedLessonIds.includes(bundle.lesson.id)) ??
    lessonBundles[lessonBundles.length - 1];
  const dueReviewItems = useMemo(() => getDueReviewItems(reviewItems, new Date()), [reviewItems]);
  const weakTargetCount = useMemo(() => getWeakTargetIds(reviewItems).length, [reviewItems]);
  const nextReviewLabel = useMemo(
    () => formatReviewDate(getNextReviewAt(reviewItems)),
    [reviewItems],
  );

  useEffect(() => {
    let cancelled = false;
    const hydrateProgress = async () => {
      const snapshot = await loadCourseProgress();
      if (cancelled) return;
      if (snapshot) {
        const knownLessonIds = new Set(lessonBundles.map((bundle) => bundle.lesson.id));
        const knownExerciseIds = new Set(
          lessonBundles.flatMap((bundle) => bundle.exercises.map((exercise) => exercise.id)),
        );
        setCompletedLessonIds(
          snapshot.completedLessonIds.filter((lessonId) => knownLessonIds.has(lessonId)),
        );
        setReviewItems(
          snapshot.reviewItems.filter(
            (item) => knownLessonIds.has(item.lessonId) && knownExerciseIds.has(item.exerciseId),
          ),
        );
        setAttemptHistory(
          snapshot.attemptHistory.filter(
            (item) => knownLessonIds.has(item.lessonId) && knownExerciseIds.has(item.exerciseId),
          ),
        );
        if (snapshot.lastLessonId) {
          const lastBundle = findLessonBundle(snapshot.lastLessonId);
          if (lastBundle) setActiveBundle(lastBundle);
        }
      }
      setProgressHydrated(true);
    };
    void hydrateProgress();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!progressHydrated) return;
    void saveCourseProgress({
      completedLessonIds,
      lastLessonId: activeBundle.lesson.id,
      reviewItems,
      attemptHistory,
    });
  }, [activeBundle.lesson.id, attemptHistory, completedLessonIds, progressHydrated, reviewItems]);

  const resetExerciseInput = () => {
    setAnswer("");
    setSelectedTokens([]);
    setResult(null);
  };

  const startLesson = (bundle: LessonBundle) => {
    setActiveBundle(bundle);
    setScreen("lesson");
    setStage("theory");
    setExerciseIndex(0);
    resetExerciseInput();
    setAttempts([]);
  };

  const startReview = () => {
    const queue = getDueReviewItems(reviewItems, new Date()).slice(0, 20);
    if (queue.length === 0) return;
    setReviewQueue(queue);
    setReviewIndex(0);
    setReviewAttempts([]);
    setRequeuedExerciseIds([]);
    resetExerciseInput();
    setScreen("review");
  };

  const recordExerciseAttempt = (
    exercise: Exercise,
    bundle: LessonBundle,
    checkResult: AnswerCheckResult,
    source: AttemptSource,
  ) => {
    const now = new Date();
    setReviewItems((previous) => {
      const existing = previous.find((item) => item.exerciseId === exercise.id);
      return upsertReviewItem(
        previous,
        scheduleExerciseReview(existing, exercise, bundle.lesson.id, checkResult.status, now),
      );
    });
    setAttemptHistory((previous) => [
      createAttemptLogEntry(exercise, bundle.lesson.id, checkResult.status, source, now),
      ...previous,
    ].slice(0, 200));
  };

  const finishExercise = (checkResult: AnswerCheckResult) => {
    if (!currentExercise) return;
    const bundle = screen === "review" ? activeReviewBundle : activeBundle;
    if (!bundle) return;
    setResult(checkResult);
    recordExerciseAttempt(
      currentExercise,
      bundle,
      checkResult,
      screen === "review" ? "review" : "lesson",
    );
    const attempt = { exerciseId: currentExercise.id, status: checkResult.status };
    if (screen === "review") {
      setReviewAttempts((previous) => [...previous, attempt]);
    } else {
      setAttempts((previous) => [...previous, attempt]);
    }
  };

  const submitAnswer = () => {
    if (!currentExercise || result) return;
    const submittedAnswer =
      currentExercise.type === "sentence-builder" ? selectedTokens.join("|") : answer;
    if (submittedAnswer.trim().length === 0) return;
    finishExercise(
      checkAnswer(
        submittedAnswer,
        currentExercise.correctAnswers,
        currentExercise.acceptableAnswers,
      ),
    );
  };

  const chooseMultipleChoice = (choice: string) => {
    if (!currentExercise || result) return;
    setAnswer(choice);
    finishExercise(
      checkAnswer(choice, currentExercise.correctAnswers, currentExercise.acceptableAnswers),
    );
  };

  const continuePractice = () => {
    if (activeBundle.exercises[exerciseIndex + 1]) {
      setExerciseIndex((previous) => previous + 1);
      resetExerciseInput();
      return;
    }
    if (lessonResult.passed) {
      setCompletedLessonIds((previous) =>
        previous.includes(activeBundle.lesson.id)
          ? previous
          : [...previous, activeBundle.lesson.id],
      );
    }
    setScreen("result");
  };

  const continueReview = () => {
    const item = reviewQueue[reviewIndex];
    if (!item || !result) return;
    const shouldRequeue =
      !isSuccessfulStatus(result.status) && !requeuedExerciseIds.includes(item.exerciseId);
    const nextQueue = shouldRequeue ? [...reviewQueue, item] : reviewQueue;
    if (shouldRequeue) {
      setReviewQueue(nextQueue);
      setRequeuedExerciseIds((previous) => [...previous, item.exerciseId]);
    }
    if (nextQueue[reviewIndex + 1]) {
      setReviewIndex((previous) => previous + 1);
      resetExerciseInput();
      return;
    }
    setScreen("review-result");
  };

  const sentenceBuilderTokens = useMemo(() => {
    if (!currentExercise || currentExercise.type !== "sentence-builder") return [];
    const correct = currentExercise.correctAnswers[0];
    return [...(correct ? correct.split("|") : []), ...(currentExercise.distractors ?? [])];
  }, [currentExercise]);

  const availableBuilderTokens = useMemo(() => {
    const remainingSelected = new Map<string, number>();
    selectedTokens.forEach((token) => {
      remainingSelected.set(token, (remainingSelected.get(token) ?? 0) + 1);
    });
    return sentenceBuilderTokens.filter((token) => {
      const selectedCount = remainingSelected.get(token) ?? 0;
      if (selectedCount > 0) {
        remainingSelected.set(token, selectedCount - 1);
        return false;
      }
      return true;
    });
  }, [selectedTokens, sentenceBuilderTokens]);

  const commonPracticeProps = currentExercise
    ? {
        currentExercise,
        answer,
        selectedTokens,
        availableBuilderTokens,
        result,
        onAnswerChange: (value: string) => {
          setAnswer(value);
          setResult(null);
        },
        onChoice: chooseMultipleChoice,
        onToken: (token: string) => setSelectedTokens((previous) => [...previous, token]),
        onRemoveToken: (index: number) =>
          setSelectedTokens((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index),
          ),
        onClearTokens: () => setSelectedTokens([]),
        onSubmit: submitAnswer,
      }
    : null;

  if (screen === "course") {
    return (
      <CourseScreen
        completedLessonIds={completedLessonIds}
        todayBundle={todayBundle}
        dueReviewCount={dueReviewItems.length}
        weakTargetCount={weakTargetCount}
        attemptCount={attemptHistory.length}
        nextReviewLabel={nextReviewLabel}
        onStartLesson={startLesson}
        onStartLessonById={(lessonId) => {
          const bundle = findLessonBundle(lessonId);
          if (bundle) startLesson(bundle);
        }}
        onStartReview={startReview}
      />
    );
  }

  if (screen === "result") {
    return (
      <LessonResultScreen
        result={lessonResult}
        activeBundle={activeBundle}
        nextBundle={nextBundle}
        onNextLesson={() => nextBundle && startLesson(nextBundle)}
        onRetry={() => startLesson(activeBundle)}
        onCourse={() => setScreen("course")}
      />
    );
  }

  if (screen === "review-result") {
    return (
      <ReviewResultScreen
        result={reviewResult}
        dueReviewCount={getDueReviewItems(reviewItems, new Date()).length}
        onContinueReview={startReview}
        onCourse={() => setScreen("course")}
      />
    );
  }

  if (!commonPracticeProps) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Не удалось открыть задание</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("course")}>
            <Text style={styles.primaryButtonText}>Вернуться к курсу</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "review") {
    if (!activeReviewBundle) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Очередь повторения повреждена</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("course")}>
              <Text style={styles.primaryButtonText}>Вернуться к курсу</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <ReviewScreen
        {...commonPracticeProps}
        lessonTitle={activeReviewBundle.lesson.title}
        exerciseIndex={reviewIndex}
        exerciseCount={reviewQueue.length}
        onCourse={() => setScreen("course")}
        onContinue={continueReview}
      />
    );
  }

  const stageIndex = lessonStages.indexOf(stage);
  return (
    <LessonScreen
      {...commonPracticeProps}
      activeBundle={activeBundle}
      stage={stage}
      exerciseIndex={exerciseIndex}
      exerciseCount={activeBundle.exercises.length}
      onCourse={() => setScreen("course")}
      onPreviousStage={() => {
        const previous = lessonStages[stageIndex - 1];
        if (previous) {
          setStage(previous);
          resetExerciseInput();
        }
      }}
      onNextStage={() => {
        const next = lessonStages[stageIndex + 1];
        if (next) {
          setStage(next);
          resetExerciseInput();
        }
      }}
      onContinue={continuePractice}
    />
  );
}
