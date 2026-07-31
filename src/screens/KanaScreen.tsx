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
  createKanaSession,
  getKanaMasterySummary,
  getSkillAverage,
  isKanaAnswerCorrect,
  updateKanaProgress,
  type KanaProgressMap,
  type KanaQuestion,
  type KanaSkill,
} from "../engine/kanaEngine";
import { hiraganaRows } from "../kana/hiragana";
import { loadKanaProgress, saveKanaProgress } from "../storage/learnerStorage";
import { kanaStyles } from "../theme/kanaStyles";

interface KanaScreenProps {
  onCourse: () => void;
}

type KanaView = "home" | "chart" | "practice" | "result";

const skillMeta: Record<KanaSkill, { title: string; body: string }> = {
  recognition: {
    title: "Узнавание знака",
    body: "Увидь ромадзи и выбери соответствующую хирагану.",
  },
  reading: {
    title: "Чтение",
    body: "Увидь знак и выбери его чтение.",
  },
  listening: {
    title: "Аудирование",
    body: "Услышь слог и найди правильный знак.",
  },
  typing: {
    title: "Самостоятельный ответ",
    body: "Увидь знак и введи его ромадзи без вариантов.",
  },
};

const skills: KanaSkill[] = ["recognition", "reading", "listening", "typing"];

export function KanaScreen({ onCourse }: KanaScreenProps) {
  const [view, setView] = useState<KanaView>("home");
  const [progress, setProgress] = useState<KanaProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [activeSkill, setActiveSkill] = useState<KanaSkill>("recognition");
  const [questions, setQuestions] = useState<KanaQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[questionIndex];
  const summary = useMemo(() => getKanaMasterySummary(progress), [progress]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const stored = await loadKanaProgress();
      if (!cancelled) {
        setProgress(stored);
        setHydrated(true);
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveKanaProgress(progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (
      view === "practice" &&
      currentQuestion?.skill === "listening" &&
      currentQuestion.speakText &&
      result === null
    ) {
      void speakJapanese(currentQuestion.speakText);
    }
  }, [currentQuestion, result, view]);

  const resetQuestion = () => {
    setAnswer("");
    setResult(null);
  };

  const startPractice = (skill: KanaSkill) => {
    setActiveSkill(skill);
    setQuestions(createKanaSession(skill, progress, 10));
    setQuestionIndex(0);
    setCorrectCount(0);
    resetQuestion();
    setView("practice");
  };

  const submitAnswer = (submitted: string) => {
    if (!currentQuestion || result !== null || submitted.trim().length === 0) return;
    const correct = isKanaAnswerCorrect(submitted, currentQuestion);
    setAnswer(submitted);
    setResult(correct);
    setCorrectCount((previous) => previous + (correct ? 1 : 0));
    setProgress((previous) =>
      updateKanaProgress(previous, currentQuestion.symbolId, currentQuestion.skill, correct),
    );
  };

  const continuePractice = () => {
    if (questions[questionIndex + 1]) {
      setQuestionIndex((previous) => previous + 1);
      resetQuestion();
      return;
    }
    setView("result");
  };

  if (!hydrated) {
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <View style={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.loadingText}>Загружаю прогресс хираганы…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (view === "result") {
    const percent = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.eyebrow}>Хирагана · результат</Text>
          <Text style={kanaStyles.resultPercent}>{percent}%</Text>
          <Text style={kanaStyles.resultTitle}>
            {percent >= 80 ? "Хорошая серия" : "Есть что закрепить"}
          </Text>
          <Text style={kanaStyles.resultBody}>
            Правильных ответов: {correctCount} из {questions.length}. Ошибочные знаки получили
            более низкий навык и вернутся в ближайших тренировках.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => startPractice(activeSkill)}>
            <Text style={kanaStyles.primaryButtonText}>Повторить этот режим</Text>
          </TouchableOpacity>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.secondaryButtonText}>К разделу хираганы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={onCourse}>
            <Text style={kanaStyles.secondaryButtonText}>К основному курсу</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "practice" && currentQuestion) {
    const multipleChoice = currentQuestion.options.length > 0;
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={kanaStyles.backButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.backButtonText}>‹ Закончить тренировку</Text>
          </TouchableOpacity>
          <Text style={kanaStyles.eyebrow}>{skillMeta[activeSkill].title}</Text>
          <View style={kanaStyles.questionCard}>
            <Text style={kanaStyles.counter}>
              {questionIndex + 1} / {questions.length}
            </Text>
            <Text style={kanaStyles.questionPrompt}>{currentQuestion.prompt}</Text>

            {currentQuestion.skill === "listening" && currentQuestion.speakText && (
              <TouchableOpacity
                accessibilityLabel="Прослушать знак ещё раз"
                style={kanaStyles.listeningButton}
                onPress={() => void speakJapanese(currentQuestion.speakText ?? "")}
              >
                <Text style={kanaStyles.listeningIcon}>🔊</Text>
              </TouchableOpacity>
            )}

            {multipleChoice ? (
              <View style={kanaStyles.optionGrid}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    disabled={result !== null}
                    style={[
                      kanaStyles.answerOption,
                      answer === option && kanaStyles.answerOptionSelected,
                    ]}
                    onPress={() => submitAnswer(option)}
                  >
                    <Text style={kanaStyles.answerOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={result === null}
                  placeholder="romaji"
                  value={answer}
                  style={kanaStyles.input}
                  onChangeText={setAnswer}
                  onSubmitEditing={() => submitAnswer(answer)}
                />
                {result === null && (
                  <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => submitAnswer(answer)}>
                    <Text style={kanaStyles.primaryButtonText}>Проверить</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {result !== null && (
              <>
                <View
                  style={[
                    kanaStyles.feedback,
                    result ? kanaStyles.feedbackCorrect : kanaStyles.feedbackIncorrect,
                  ]}
                >
                  <Text style={kanaStyles.feedbackText}>{result ? "Верно" : "Пока нет"}</Text>
                  <Text style={kanaStyles.feedbackAnswer}>
                    Правильный ответ: {currentQuestion.correctAnswer}
                  </Text>
                </View>
                <TouchableOpacity style={kanaStyles.primaryButton} onPress={continuePractice}>
                  <Text style={kanaStyles.primaryButtonText}>
                    {questions[questionIndex + 1] ? "Следующий знак" : "Показать результат"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "chart") {
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.container}>
          <TouchableOpacity style={kanaStyles.backButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.backButtonText}>‹ К тренировкам</Text>
          </TouchableOpacity>
          <Text style={kanaStyles.eyebrow}>Таблица</Text>
          <Text style={kanaStyles.title}>Базовая хирагана</Text>
          <Text style={kanaStyles.description}>
            Нажми на знак, чтобы услышать его. Зелёным отмечены знаки, освоенные во всех четырёх
            навыках.
          </Text>

          {hiraganaRows.map((row) => (
            <View key={row.id} style={kanaStyles.chartRow}>
              <Text style={kanaStyles.chartRowTitle}>{row.label}</Text>
              <View style={kanaStyles.chartGrid}>
                {row.symbols.map((symbol) => {
                  const item = progress[symbol.id];
                  const known =
                    !!item &&
                    item.recognition >= 3 &&
                    item.reading >= 3 &&
                    item.listening >= 3 &&
                    item.typing >= 3;
                  return (
                    <TouchableOpacity
                      key={symbol.id}
                      style={[kanaStyles.kanaCell, known && kanaStyles.kanaCellKnown]}
                      onPress={() => void speakJapanese(symbol.kana)}
                    >
                      <Text style={kanaStyles.kanaGlyph}>{symbol.kana}</Text>
                      <Text style={kanaStyles.kanaRomaji}>{symbol.romaji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={kanaStyles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={kanaStyles.container}>
        <TouchableOpacity style={kanaStyles.backButton} onPress={onCourse}>
          <Text style={kanaStyles.backButtonText}>‹ К основному курсу</Text>
        </TouchableOpacity>
        <Text style={kanaStyles.eyebrow}>Азбука</Text>
        <Text style={kanaStyles.title}>Хирагана</Text>
        <Text style={kanaStyles.description}>
          Не просто таблица: приложение отдельно отслеживает узнавание, чтение, слух и
          самостоятельный ответ для каждого знака.
        </Text>

        <View style={kanaStyles.heroCard}>
          <Text style={kanaStyles.heroKana}>あいうえお</Text>
          <Text style={kanaStyles.heroTitle}>{summary.mastered} из {summary.total} освоено</Text>
          <Text style={kanaStyles.heroBody}>
            Начато знаков: {summary.started}. Общая наполненность навыков: {summary.averagePercent}%.
          </Text>
          <View style={kanaStyles.progressRow}>
            <Text style={kanaStyles.progressLabel}>Общий прогресс</Text>
            <Text style={kanaStyles.progressValue}>{summary.averagePercent}%</Text>
          </View>
          <View style={kanaStyles.progressTrack}>
            <View style={[kanaStyles.progressFill, { width: `${summary.averagePercent}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("chart")}>
          <Text style={kanaStyles.secondaryButtonText}>Открыть таблицу 46 знаков</Text>
        </TouchableOpacity>

        <Text style={kanaStyles.sectionTitle}>Тренировки</Text>
        {skills.map((skill) => (
          <TouchableOpacity key={skill} style={kanaStyles.skillCard} onPress={() => startPractice(skill)}>
            <View style={kanaStyles.skillHeader}>
              <Text style={kanaStyles.skillTitle}>{skillMeta[skill].title}</Text>
              <Text style={kanaStyles.skillPercent}>{getSkillAverage(progress, skill)}%</Text>
            </View>
            <Text style={kanaStyles.skillBody}>{skillMeta[skill].body}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
