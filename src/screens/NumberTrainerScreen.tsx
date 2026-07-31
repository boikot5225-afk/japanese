import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import {
  buildNumberRemediation,
  buildNumberSession,
  checkNumberAnswer,
  getNumberSetMastery,
  getNumberTrainerSummary,
  numberSkillKey,
  numberTrainingSets,
  updateNumberProgress,
  type NumberAnswerResult,
  type NumberProgressMap,
  type NumberQuestion,
  type NumberSessionId,
  type NumberTrainingSet,
} from "../engine/numberTrainer";
import {
  loadNumberProgress,
  saveNumberProgress,
} from "../storage/learnerStorage";
import { numberStyles } from "../theme/numberStyles";

interface NumberTrainerScreenProps {
  onCourse: () => void;
}

type ViewMode = "menu" | "session" | "result";

interface SessionStats {
  correct: number;
  total: number;
}

const sessionTitle = (sessionId: NumberSessionId): string =>
  sessionId === "mixed"
    ? "Смешанная проверка"
    : numberTrainingSets.find((set) => set.id === sessionId)?.title ?? "Числительные";

const sectionLabel = (section: NumberTrainingSet["section"]): string =>
  section === "numbers" ? "Числа и разряды" : "Счётные слова";

export function NumberTrainerScreen({ onCourse }: NumberTrainerScreenProps) {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<NumberProgressMap>({});
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [activeSessionId, setActiveSessionId] = useState<NumberSessionId>("basic");
  const [queue, setQueue] = useState<NumberQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answerResult, setAnswerResult] = useState<NumberAnswerResult | null>(null);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, total: 0 });
  const [scheduledRemediationSkills, setScheduledRemediationSkills] = useState<string[]>([]);

  const currentQuestion = queue[questionIndex];
  const summary = useMemo(() => getNumberTrainerSummary(progress), [progress]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const stored = await loadNumberProgress();
      if (cancelled) return;
      setProgress(stored);
      setHydrated(true);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveNumberProgress(progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (
      viewMode === "session" &&
      currentQuestion?.mode === "listening-to-digits" &&
      currentQuestion.speechText &&
      !answerResult
    ) {
      void speakJapanese(currentQuestion.speechText);
    }
  }, [answerResult, currentQuestion, viewMode]);

  const resetQuestionState = () => {
    setAnswer("");
    setAnswerResult(null);
  };

  const startSession = (sessionId: NumberSessionId) => {
    const nextQueue = buildNumberSession(sessionId, progress, Date.now());
    if (nextQueue.length === 0) return;
    setActiveSessionId(sessionId);
    setQueue(nextQueue);
    setQuestionIndex(0);
    setStats({ correct: 0, total: 0 });
    setScheduledRemediationSkills([]);
    resetQuestionState();
    setViewMode("session");
  };

  const submitAnswer = () => {
    if (!currentQuestion || answerResult || answer.trim().length === 0) return;
    const checked = checkNumberAnswer(currentQuestion, answer);
    setAnswerResult(checked);
    setStats((previous) => ({
      correct: previous.correct + (checked.correct ? 1 : 0),
      total: previous.total + 1,
    }));
    setProgress((previous) =>
      updateNumberProgress(previous, currentQuestion, checked.correct),
    );

    if (!checked.correct && !currentQuestion.remediation) {
      const skillKey = numberSkillKey(currentQuestion.sourceSetId, currentQuestion.mode);
      if (!scheduledRemediationSkills.includes(skillKey)) {
        const remediation = buildNumberRemediation(
          currentQuestion,
          queue.map((question) => question.semanticKey),
          Date.now() + questionIndex,
        );
        if (remediation) {
          const insertAt = Math.min(questionIndex + 3, queue.length);
          setQueue((previous) => [
            ...previous.slice(0, insertAt),
            remediation,
            ...previous.slice(insertAt),
          ]);
          setScheduledRemediationSkills((previous) => [...previous, skillKey]);
        }
      }
    }
  };

  const continueSession = () => {
    if (!answerResult) return;
    if (queue[questionIndex + 1]) {
      setQuestionIndex((previous) => previous + 1);
      resetQuestionState();
      return;
    }
    setViewMode("result");
  };

  const exitToMenu = () => {
    setViewMode("menu");
    setQueue([]);
    setQuestionIndex(0);
    resetQuestionState();
  };

  if (!hydrated) {
    return (
      <SafeAreaView style={numberStyles.safeArea}>
        <View style={numberStyles.loading}>
          <Text style={numberStyles.loadingText}>Загружаю прогресс числительных…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (viewMode === "result") {
    const percent = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return (
      <SafeAreaView style={numberStyles.resultContainer}>
        <Text style={numberStyles.resultEyebrow}>Тренировка завершена</Text>
        <Text style={numberStyles.resultTitle}>{sessionTitle(activeSessionId)}</Text>
        <Text style={numberStyles.resultPercent}>{percent}%</Text>
        <Text style={numberStyles.resultText}>
          Правильных ответов: {stats.correct} из {stats.total}. Ошибочные навыки уже
          получили меньший вес мастерства и появятся раньше в следующей сессии.
        </Text>
        <TouchableOpacity
          style={numberStyles.resultButton}
          onPress={() => startSession(activeSessionId)}
        >
          <Text style={numberStyles.resultButtonText}>Пройти ещё раз</Text>
        </TouchableOpacity>
        <TouchableOpacity style={numberStyles.resultSecondaryButton} onPress={exitToMenu}>
          <Text style={numberStyles.resultSecondaryText}>К разделам тренажёра</Text>
        </TouchableOpacity>
        <TouchableOpacity style={numberStyles.resultSecondaryButton} onPress={onCourse}>
          <Text style={numberStyles.resultSecondaryText}>К основному курсу</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (viewMode === "session" && currentQuestion) {
    const selectedChoice = currentQuestion.choices?.includes(answer) ?? false;
    const canPlaySpeech = Boolean(
      currentQuestion.speechText &&
        (currentQuestion.mode === "listening-to-digits" || answerResult),
    );
    return (
      <SafeAreaView style={numberStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={numberStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={numberStyles.backButton} onPress={exitToMenu}>
            <Text style={numberStyles.backButtonText}>‹ Прервать тренировку</Text>
          </TouchableOpacity>
          <View style={numberStyles.practiceHeader}>
            <Text style={numberStyles.practiceTitle}>{sessionTitle(activeSessionId)}</Text>
            <Text style={numberStyles.counter}>
              {questionIndex + 1}/{queue.length}
            </Text>
          </View>

          <View style={numberStyles.practiceCard}>
            <Text style={numberStyles.prompt}>{currentQuestion.prompt}</Text>
            {currentQuestion.displayText && (
              <Text style={numberStyles.displayText}>{currentQuestion.displayText}</Text>
            )}

            {canPlaySpeech && (
              <TouchableOpacity
                style={numberStyles.listenButton}
                onPress={() => void speakJapanese(currentQuestion.speechText ?? "")}
              >
                <Text style={numberStyles.listenButtonText}>
                  🔊 {currentQuestion.mode === "listening-to-digits"
                    ? "Прослушать ещё раз"
                    : "Прослушать правильное чтение"}
                </Text>
              </TouchableOpacity>
            )}

            {currentQuestion.choices ? (
              <View>
                {currentQuestion.choices.map((choice) => (
                  <TouchableOpacity
                    key={choice}
                    disabled={Boolean(answerResult)}
                    style={[
                      numberStyles.choiceButton,
                      answer === choice && numberStyles.choiceButtonSelected,
                    ]}
                    onPress={() => setAnswer(choice)}
                  >
                    <Text style={numberStyles.choiceText}>{choice}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                value={answer}
                editable={!answerResult}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={currentQuestion.keyboard === "numeric" ? "number-pad" : "default"}
                placeholder={currentQuestion.keyboard === "numeric" ? "Введите число" : "Введите чтение хираганой"}
                style={numberStyles.input}
                onChangeText={setAnswer}
                onSubmitEditing={submitAnswer}
              />
            )}

            {!answerResult ? (
              <TouchableOpacity
                disabled={answer.trim().length === 0 || (Boolean(currentQuestion.choices) && !selectedChoice)}
                style={[
                  numberStyles.submitButton,
                  (answer.trim().length === 0 || (Boolean(currentQuestion.choices) && !selectedChoice)) &&
                    numberStyles.disabledButton,
                ]}
                onPress={submitAnswer}
              >
                <Text style={numberStyles.submitButtonText}>Проверить</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View
                  style={[
                    numberStyles.feedback,
                    answerResult.correct
                      ? numberStyles.feedbackCorrect
                      : numberStyles.feedbackIncorrect,
                  ]}
                >
                  <Text style={numberStyles.feedbackTitle}>
                    {answerResult.correct ? "Верно" : "Нужно поправить"}
                  </Text>
                  <Text style={numberStyles.feedbackBody}>{answerResult.feedback}</Text>
                  {!answerResult.correct && (
                    <Text style={numberStyles.correctAnswer}>
                      Правильный ответ: {answerResult.correctAnswer}
                    </Text>
                  )}
                  <Text style={numberStyles.feedbackBody}>{currentQuestion.explanation}</Text>
                </View>
                <TouchableOpacity
                  style={numberStyles.continueButton}
                  onPress={continueSession}
                >
                  <Text style={numberStyles.continueButtonText}>
                    {queue[questionIndex + 1] ? "Дальше" : "Завершить"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderSet = (set: NumberTrainingSet) => {
    const mastery = getNumberSetMastery(progress, set.id);
    const percent = Math.round((mastery / 5) * 100);
    return (
      <View key={set.id} style={numberStyles.setCard}>
        <View style={numberStyles.setHeader}>
          <View style={numberStyles.setTitleBlock}>
            <Text style={numberStyles.setShortTitle}>{set.shortTitle}</Text>
            <Text style={numberStyles.setTitle}>{set.title}</Text>
          </View>
          <View style={numberStyles.masteryBadge}>
            <Text style={numberStyles.masteryValue}>{percent}%</Text>
            <Text style={numberStyles.masteryLabel}>навык</Text>
          </View>
        </View>
        <Text style={numberStyles.setDescription}>{set.description}</Text>
        <Text style={numberStyles.setExample}>{set.example}</Text>
        <View style={numberStyles.progressTrack}>
          <View style={[numberStyles.progressFill, { width: `${percent}%` }]} />
        </View>
        <TouchableOpacity
          style={numberStyles.setButton}
          onPress={() => startSession(set.id)}
        >
          <Text style={numberStyles.setButtonText}>
            {percent > 0 ? "Продолжить тренировку" : "Начать тренировку"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={numberStyles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={numberStyles.container}>
        <TouchableOpacity style={numberStyles.backButton} onPress={onCourse}>
          <Text style={numberStyles.backButtonText}>‹ К основному курсу</Text>
        </TouchableOpacity>
        <Text style={numberStyles.eyebrow}>Отдельный тренажёр</Text>
        <Text style={numberStyles.title}>Числа и счётные слова</Text>
        <Text style={numberStyles.description}>
          Чтение, диктант, ввод цифрами и хираганой. Ошибка возвращается на другом
          числе того же типа, поэтому одна и та же задача не ходит кругами по комнате.
        </Text>

        <View style={numberStyles.summaryCard}>
          <Text style={numberStyles.summaryTitle}>Общий прогресс</Text>
          <Text style={numberStyles.summaryText}>
            Начато разделов: {summary.startedSets} из {numberTrainingSets.length} · освоено:
            {" "}{summary.masteredSets} · выполнено ответов: {summary.totalAttempts}.
          </Text>
          <Text style={numberStyles.summaryGlyph}>一 十 百 千 万</Text>
        </View>

        {(["numbers", "counters"] as const).map((section) => (
          <View key={section}>
            <Text style={numberStyles.sectionTitle}>{sectionLabel(section)}</Text>
            {numberTrainingSets.filter((set) => set.section === section).map(renderSet)}
          </View>
        ))}

        <Text style={numberStyles.sectionTitle}>Контроль</Text>
        <View style={numberStyles.mixedCard}>
          <Text style={numberStyles.mixedTitle}>Смешанная проверка</Text>
          <Text style={numberStyles.mixedBody}>
            15 уникальных заданий из разных разрядов и счётных слов. Слабые форматы
            получают приоритет, но одно и то же значение в сессии не повторяется.
          </Text>
          <TouchableOpacity
            style={numberStyles.setButton}
            onPress={() => startSession("mixed")}
          >
            <Text style={numberStyles.setButtonText}>Начать смешанную проверку</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
