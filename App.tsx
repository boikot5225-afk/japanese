import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import { findLessonBundle, lessonBundles } from "./src/content/courseCatalog";
import type { LessonBundle } from "./src/content/lessonBundle";
import type { Exercise, Skill } from "./src/domain/course";
import { checkAnswer, type AnswerCheckResult } from "./src/engine/checkAnswer";
import { createKnownHiraganaProgress } from "./src/engine/kanaEngine";
import {
  commitLessonReviewItems,
  type LessonRunMode,
} from "./src/engine/lessonReview";
import { calculateLessonResult, type ExerciseAttempt } from "./src/engine/lessonSession";
import {
  createAttemptLogEntry,
  getDueReviewItems,
  getNextReviewAt,
  getWeakTargetIds,
  isSuccessfulStatus,
  reviewItemKey,
  scheduleItemReview,
  selectExerciseForReview,
  upsertReviewItem,
  type AttemptLogEntry,
  type AttemptSource,
  type ReviewItem,
} from "./src/engine/reviewEngine";
import { CourseScreen } from "./src/screens/CourseScreen";
import { KanaScreen } from "./src/screens/KanaScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { LessonResultScreen, ReviewResultScreen } from "./src/screens/ResultScreens";
import { LessonScreen, ReviewScreen, type LessonStage } from "./src/screens/TrainingScreens";
import {
  loadKanaProgress,
  loadLearnerProfile,
  saveKanaProgress,
  saveLearnerProfile,
  type LearnerStartLevel,
} from "./src/storage/learnerStorage";
import { loadCourseProgress, saveCourseProgress } from "./src/storage/progressStorage";
import { styles } from "./src/theme/appStyles";

type Screen = "course" | "kana" | "lesson" | "result" | "review" | "review-result";
const lessonStages: LessonStage[] = ["theory", "words", "examples", "practice"];
const initialBundle: LessonBundle = lessonBundles[0] ?? (() => {
  throw new Error("В курсе нет ни одного урока.");
})();

const skillLabels: Record<Skill, string> = {
  recognition: "узнавание",
  recall: "воспроизведение",
  reading: "чтение",
  listening: "аудирование",
  writing: "письмо",
  usage: "употребление",
};

const getLearningItemLabel = (bundle: LessonBundle, itemId: string): string => {
  const vocabulary = bundle.vocabulary.find((item) => item.id === itemId);
  if (vocabulary) return `${vocabulary.writtenForm} — ${vocabulary.meaningsRu[0] ?? "слово"}`;
  const grammar = bundle.grammar.find((item) => item.id === itemId);
  if (grammar) return grammar.title;
  const sentence = bundle.sentences.find((item) => item.id === itemId);
  if (sentence) return sentence.japanese;
  return "Материал урока";
};

const formatReviewDate = (value: string | null): string => {
  if (!value) return "после первого пройденного урока";
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
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [stage, setStage] = useState<LessonStage>("theory");
  const [lessonRunMode, setLessonRunMode] = useState<LessonRunMode>("learning");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerCheckResult | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAttempts, setReviewAttempts] = useState<ExerciseAttempt[]>([]);
  const [requeuedReviewKeys, setRequeuedReviewKeys] = useState<string[]>([]);

  const lessonExercise = activeBundle.exercises[exerciseIndex];
  const activeReviewItem = reviewQueue[reviewIndex];
  const activeReviewBundle = activeReviewItem ? findLessonBundle(activeReviewItem.lessonId) : undefined;
  const reviewExercise = activeReviewItem && activeReviewBundle
    ? selectExerciseForReview(activeReviewItem, activeReviewBundle.exercises)
    : undefined;
  const currentExercise = screen === "review" ? reviewExercise : lessonExercise;
  const reviewFocusLabel = activeReviewItem && activeReviewBundle
    ? `${getLearningItemLabel(activeReviewBundle, activeReviewItem.itemId)} · ${skillLabels[activeReviewItem.skill]}`
    : "Материал урока";
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
        const knownItemIds = new Set(
          lessonBundles.flatMap((bundle) => bundle.lesson.itemIds),
        );
        const validCompletedLessonIds = snapshot.completedLessonIds.filter((lessonId) =>
          knownLessonIds.has(lessonId),
        );
        const completedLessonIdSet = new Set(validCompletedLessonIds);
        setCompletedLessonIds(validCompletedLessonIds);
        setReviewItems(
          snapshot.reviewItems.filter(
            (item) =>
              completedLessonIdSet.has(item.lessonId) &&
              knownExerciseIds.has(item.exerciseId) &&
              knownItemIds.has(item.itemId),
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hydrateProfile = async () => {
      const profile = await loadLearnerProfile();
      if (cancelled) return;
      setOnboardingComplete(profile?.onboardingComplete === true);
      setProfileHydrated(true);
    };
    void hydrateProfile();
    return () => {
      cancelled = true;
    };
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

  const completeOnboarding = async (level: LearnerStartLevel) => {
    await saveLearnerProfile(level);
    if (level !== "zero") {
      const existing = await loadKanaProgress();
      await saveKanaProgress({ ...existing, ...createKnownHiraganaProgress() });
    }
    setOnboardingComplete(true);
    setScreen(level === "zero" ? "kana" : "course");
  };

  const resetExerciseInput = () => {
    setAnswer("");
    setSelectedTokens([]);
    setResult(null);
  };

  const startLesson = (bundle: LessonBundle, mode: LessonRunMode) => {
    setActiveBundle(bundle);
    setLessonRunMode(mode);
    setScreen("lesson");
    setStage("theory");
    setExerciseIndex(0);
    resetExerciseInput();
    setAttempts([]);
  };

  const openCourseLesson = (bundle: LessonBundle) => {
    const mode: LessonRunMode = completedLessonIds.includes(bundle.lesson.id)
      ? "practice"
      : "learning";
    startLesson(bundle, mode);
  };

  const startReview = () => {
    const queue = getDueReviewItems(reviewItems, new Date()).slice(0, 20);
    if (queue.length === 0) return;
    setReviewQueue(queue);
    setReviewIndex(0);
    setReviewAttempts([]);
    setRequeuedReviewKeys([]);
    resetExerciseInput();
    setScreen("review");
  };

  const recordExerciseAttempt = (
    exercise: Exercise,
    bundle: LessonBundle,
    checkResult: AnswerCheckResult,
    source: AttemptSource,
    reviewItem?: ReviewItem,
  ) => {
    const now = new Date();
    if (source === "review" && reviewItem) {
      setReviewItems((previous) => {
        const key = reviewItemKey(reviewItem);
        const existing = previous.find((item) => reviewItemKey(item) === key);
        return upsertReviewItem(
          previous,
          scheduleItemReview(
            existing,
            reviewItem.itemId,
            reviewItem.skill,
            exercise,
            reviewItem.lessonId,
            checkResult.status,
            now,
          ),
        );
      });
    }
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
    const source: AttemptSource = screen === "review"
      ? "review"
      : lessonRunMode === "practice"
        ? "practice"
        : "lesson";
    recordExerciseAttempt(currentExercise, bundle, checkResult, source, activeReviewItem);
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

    setReviewItems((previous) =>
      commitLessonReviewItems({
        items: previous,
        exercises: activeBundle.exercises,
        attempts,
        lessonId: activeBundle.lesson.id,
        mode: lessonRunMode,
        passed: lessonResult.passed,
        now: new Date(),
      }),
    );

    if (lessonRunMode === "learning" && lessonResult.passed) {
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
    const key = reviewItemKey(item);
    const shouldRequeue =
      !isSuccessfulStatus(result.status) && !requeuedReviewKeys.includes(key);
    const repeatedItem = currentExercise
      ? scheduleItemReview(
          item,
          item.itemId,
          item.skill,
          currentExercise,
          item.lessonId,
          result.status,
          new Date(),
        )
      : item;
    const nextQueue = shouldRequeue ? [...reviewQueue, repeatedItem] : reviewQueue;
    if (shouldRequeue) {
      setReviewQueue(nextQueue);
      setRequeuedReviewKeys((previous) => [...previous, key]);
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

  if (!progressHydrated || !profileHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultSummary}>Загружаю курс и прогресс…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={(level) => void completeOnboarding(level)} />;
  }

  if (screen === "kana") {
    return <KanaScreen onCourse={() => setScreen("course")} />;
  }

  if (screen === "course") {
    return (
      <CourseScreen
        completedLessonIds={completedLessonIds}
        todayBundle={todayBundle}
        dueReviewCount={dueReviewItems.length}
        weakTargetCount={weakTargetCount}
        nextReviewLabel={nextReviewLabel}
        onStartLesson={openCourseLesson}
        onStartLessonById={(lessonId) => {
          const bundle = findLessonBundle(lessonId);
          if (bundle) openCourseLesson(bundle);
        }}
        onStartReview={startReview}
        onOpenKana={() => setScreen("kana")}
      />
    );
  }

  if (screen === "result") {
    const retryMode: LessonRunMode =
      lessonRunMode === "learning" && !lessonResult.passed ? "learning" : "practice";
    return (
      <LessonResultScreen
        result={lessonResult}
        activeBundle={activeBundle}
        nextBundle={nextBundle}
        mode={lessonRunMode}
        onNextLesson={() => nextBundle && startLesson(nextBundle, "learning")}
        onRetry={() => startLesson(activeBundle, retryMode)}
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
    if (!activeReviewBundle || !activeReviewItem) {
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
        focusLabel={reviewFocusLabel}
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
      practiceMode={lessonRunMode === "practice"}
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
