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
  getKanaDisplayRomaji,
  getKanaMasterySummary,
  getSkillAverage,
  isKanaAnswerCorrect,
  isKanaSymbolMastered,
  updateKanaProgress,
  type KanaProgressMap,
  type KanaQuestion,
  type KanaSkill,
} from "../engine/kanaEngine";
import {
  createKanaWordSession,
  createWordTokenPool,
  getKanaWordSummary,
  isKanaWordAnswerCorrect,
  updateKanaWordProgress,
  type KanaWordProgressMap,
} from "../engine/kanaWordEngine";
import type { HiraganaRow, KanaSymbol } from "../kana/hiragana";
import type { KanaWord } from "../kana/kanaWords";
import { kanaStyles } from "../theme/kanaStyles";

export interface KanaTrainingSet {
  id: string;
  title: string;
  shortTitle: string;
  body: string;
  hero: string;
  chartDescription: string;
  rows: readonly HiraganaRow[];
  pool: readonly KanaSymbol[];
}

export interface KanaRuleCard {
  kana: string;
  title: string;
  body: string;
}

interface KanaTrainerScreenProps {
  scriptTitle: string;
  scriptEyebrow: string;
  description: string;
  sets: readonly KanaTrainingSet[];
  words: readonly KanaWord[];
  wordExamples: string;
  wordDescription: string;
  rules: readonly KanaRuleCard[];
  progress: KanaProgressMap;
  wordProgress: KanaWordProgressMap;
  onProgressChange: (progress: KanaProgressMap) => void;
  onWordProgressChange: (progress: KanaWordProgressMap) => void;
  onBack: () => void;
}

type KanaView = "home" | "chart" | "practice" | "result" | "word-practice" | "word-result";

const skillMeta: Record<KanaSkill, { title: string; body: string }> = {
  recognition: {
    title: "Узнавание записи",
    body: "Увидь чтение или код ввода и выбери соответствующую японскую запись.",
  },
  reading: {
    title: "Чтение",
    body: "Увидь японскую запись и выбери, как она произносится.",
  },
  listening: {
    title: "Аудирование",
    body: "Услышь мору и найди возможную запись. Неоднозначные пары здесь не проверяются.",
  },
  typing: {
    title: "Самостоятельный ввод",
    body: "Увидь запись и введи ромадзи или точный код японской клавиатуры.",
  },
};

const skills: readonly KanaSkill[] = ["recognition", "reading", "listening", "typing"];

const availableTokens = (pool: string[], selected: string[]): string[] => {
  const selectedCounts = new Map<string, number>();
  selected.forEach((token) => selectedCounts.set(token, (selectedCounts.get(token) ?? 0) + 1));
  return pool.filter((token) => {
    const count = selectedCounts.get(token) ?? 0;
    if (count <= 0) return true;
    selectedCounts.set(token, count - 1);
    return false;
  });
};

export function KanaTrainerScreen({
  scriptTitle,
  scriptEyebrow,
  description,
  sets,
  words,
  wordExamples,
  wordDescription,
  rules,
  progress,
  wordProgress,
  onProgressChange,
  onWordProgressChange,
  onBack,
}: KanaTrainerScreenProps) {
  const firstSet = sets[0];
  const [view, setView] = useState<KanaView>("home");
  const [activeSetId, setActiveSetId] = useState(firstSet?.id ?? "");
  const [activeSkill, setActiveSkill] = useState<KanaSkill>("recognition");
  const [questions, setQuestions] = useState<KanaQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wordQueue, setWordQueue] = useState<KanaWord[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedWordTokens, setSelectedWordTokens] = useState<string[]>([]);
  const [wordResult, setWordResult] = useState<boolean | null>(null);
  const [wordCorrectCount, setWordCorrectCount] = useState(0);
  const [requeuedWordIds, setRequeuedWordIds] = useState<string[]>([]);

  const activeSet = sets.find((item) => item.id === activeSetId) ?? firstSet;
  const currentQuestion = questions[questionIndex];
  const currentWord = wordQueue[wordIndex];
  const summary = useMemo(
    () => getKanaMasterySummary(progress, activeSet?.pool ?? []),
    [activeSet?.pool, progress],
  );
  const wordSummary = useMemo(
    () => getKanaWordSummary(wordProgress, words),
    [wordProgress, words],
  );
  const wordTokenPool = useMemo(
    () => (currentWord ? createWordTokenPool(currentWord) : []),
    [currentWord],
  );
  const remainingWordTokens = useMemo(
    () => availableTokens(wordTokenPool, selectedWordTokens),
    [selectedWordTokens, wordTokenPool],
  );

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
    if (!activeSet) return;
    setActiveSkill(skill);
    setQuestions(createKanaSession(skill, progress, 10, activeSet.pool));
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
    onProgressChange(
      updateKanaProgress(progress, currentQuestion.symbolId, currentQuestion.skill, correct),
    );
  };

  const continuePractice = () => {
    if (questions[questionIndex + 1]) {
      setQuestionIndex((previous) => previous + 1);
      resetQuestion();
    } else {
      setView("result");
    }
  };

  const resetWordQuestion = () => {
    setSelectedWordTokens([]);
    setWordResult(null);
  };

  const startWordPractice = () => {
    setWordQueue(createKanaWordSession(wordProgress, 8, words));
    setWordIndex(0);
    setWordCorrectCount(0);
    setRequeuedWordIds([]);
    resetWordQuestion();
    setView("word-practice");
  };

  const submitWord = () => {
    if (!currentWord || wordResult !== null || selectedWordTokens.length === 0) return;
    const correct = isKanaWordAnswerCorrect(selectedWordTokens, currentWord);
    setWordResult(correct);
    setWordCorrectCount((previous) => previous + (correct ? 1 : 0));
    onWordProgressChange(updateKanaWordProgress(wordProgress, currentWord.id, correct));
    void speakJapanese(currentWord.kana);
  };

  const continueWordPractice = () => {
    if (!currentWord || wordResult === null) return;
    const shouldRequeue = !wordResult && !requeuedWordIds.includes(currentWord.id);
    const nextQueue = shouldRequeue ? [...wordQueue, currentWord] : wordQueue;
    if (shouldRequeue) {
      setWordQueue(nextQueue);
      setRequeuedWordIds((previous) => [...previous, currentWord.id]);
    }
    if (nextQueue[wordIndex + 1]) {
      setWordIndex((previous) => previous + 1);
      resetWordQuestion();
    } else {
      setView("word-result");
    }
  };

  if (!activeSet) {
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <View style={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.loadingText}>Для этой азбуки пока нет наборов.</Text>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={onBack}>
            <Text style={kanaStyles.secondaryButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (view === "word-result") {
    const percent = wordQueue.length === 0 ? 0 : Math.round((wordCorrectCount / wordQueue.length) * 100);
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.eyebrow}>{scriptTitle} · слова</Text>
          <Text style={kanaStyles.resultPercent}>{percent}%</Text>
          <Text style={kanaStyles.resultTitle}>{percent >= 80 ? "Слова складываются" : "Нужно закрепить"}</Text>
          <Text style={kanaStyles.resultBody}>
            Правильных попыток: {wordCorrectCount} из {wordQueue.length}. Ошибочные слова один раз возвращались в конец сессии.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={startWordPractice}>
            <Text style={kanaStyles.primaryButtonText}>Повторить слова</Text>
          </TouchableOpacity>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.secondaryButtonText}>К разделу {scriptTitle.toLowerCase()}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "word-practice" && currentWord) {
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={kanaStyles.backButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.backButtonText}>‹ Закончить сборку слов</Text>
          </TouchableOpacity>
          <Text style={kanaStyles.eyebrow}>{scriptTitle} · орфография</Text>
          <View style={kanaStyles.questionCard}>
            <Text style={kanaStyles.counter}>{wordIndex + 1} / {wordQueue.length}</Text>
            <Text style={kanaStyles.wordMeaningPrompt}>Собери: {currentWord.meaningRu}</Text>
            <TouchableOpacity
              accessibilityLabel="Прослушать слово"
              style={kanaStyles.compactSoundButton}
              onPress={() => void speakJapanese(currentWord.kana)}
            >
              <Text style={kanaStyles.compactSoundText}>🔊 Прослушать</Text>
            </TouchableOpacity>

            <View style={kanaStyles.wordAnswerArea}>
              {selectedWordTokens.length === 0 ? (
                <Text style={kanaStyles.wordPlaceholder}>Нажимай знаки в нужном порядке</Text>
              ) : (
                selectedWordTokens.map((token, index) => (
                  <TouchableOpacity
                    key={`${token}-${index}`}
                    disabled={wordResult !== null}
                    style={kanaStyles.selectedWordToken}
                    onPress={() =>
                      setSelectedWordTokens((previous) =>
                        previous.filter((_, tokenIndex) => tokenIndex !== index),
                      )
                    }
                  >
                    <Text style={kanaStyles.selectedWordTokenText}>{token}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={kanaStyles.wordTokenGrid}>
              {remainingWordTokens.map((token, index) => (
                <TouchableOpacity
                  key={`${token}-${index}`}
                  disabled={wordResult !== null}
                  style={kanaStyles.wordTokenButton}
                  onPress={() => setSelectedWordTokens((previous) => [...previous, token])}
                >
                  <Text style={kanaStyles.wordTokenText}>{token}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {wordResult === null ? (
              <View style={kanaStyles.wordActionsRow}>
                <TouchableOpacity style={kanaStyles.clearWordButton} onPress={() => setSelectedWordTokens([])}>
                  <Text style={kanaStyles.clearWordButtonText}>Очистить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={kanaStyles.primaryButtonCompact} onPress={submitWord}>
                  <Text style={kanaStyles.primaryButtonText}>Проверить</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[kanaStyles.feedback, wordResult ? kanaStyles.feedbackCorrect : kanaStyles.feedbackIncorrect]}>
                  <Text style={kanaStyles.feedbackText}>{wordResult ? "Верно" : "Пока нет"}</Text>
                  <Text style={kanaStyles.wordCorrectAnswer}>{currentWord.kana} · {currentWord.romaji}</Text>
                  <Text style={kanaStyles.feedbackAnswer}>{currentWord.explanationRu}</Text>
                </View>
                <TouchableOpacity style={kanaStyles.primaryButton} onPress={continueWordPractice}>
                  <Text style={kanaStyles.primaryButtonText}>
                    {wordQueue[wordIndex + 1] || (!wordResult && !requeuedWordIds.includes(currentWord.id))
                      ? "Следующее слово"
                      : "Показать результат"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "result") {
    const percent = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.eyebrow}>{activeSet.shortTitle} · результат</Text>
          <Text style={kanaStyles.resultPercent}>{percent}%</Text>
          <Text style={kanaStyles.resultTitle}>{percent >= 80 ? "Хорошая серия" : "Есть что закрепить"}</Text>
          <Text style={kanaStyles.resultBody}>
            Правильных ответов: {correctCount} из {questions.length}. Слабые записи вернутся в ближайших тренировках.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => startPractice(activeSkill)}>
            <Text style={kanaStyles.primaryButtonText}>Повторить этот режим</Text>
          </TouchableOpacity>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.secondaryButtonText}>К разделу {scriptTitle.toLowerCase()}</Text>
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
          <Text style={kanaStyles.eyebrow}>{activeSet.shortTitle} · {skillMeta[activeSkill].title}</Text>
          <View style={kanaStyles.questionCard}>
            <Text style={kanaStyles.counter}>{questionIndex + 1} / {questions.length}</Text>
            <Text style={kanaStyles.questionPrompt}>{currentQuestion.prompt}</Text>

            {currentQuestion.skill === "listening" && currentQuestion.speakText && (
              <TouchableOpacity
                accessibilityLabel="Прослушать ещё раз"
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
                    style={[kanaStyles.answerOption, answer === option && kanaStyles.answerOptionSelected]}
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
                <View style={[kanaStyles.feedback, result ? kanaStyles.feedbackCorrect : kanaStyles.feedbackIncorrect]}>
                  <Text style={kanaStyles.feedbackText}>{result ? "Верно" : "Пока нет"}</Text>
                  <Text style={kanaStyles.feedbackAnswer}>Правильный ответ: {currentQuestion.correctAnswer}</Text>
                  {currentQuestion.noteRu && <Text style={kanaStyles.feedbackAnswer}>{currentQuestion.noteRu}</Text>}
                </View>
                <TouchableOpacity style={kanaStyles.primaryButton} onPress={continuePractice}>
                  <Text style={kanaStyles.primaryButtonText}>
                    {questions[questionIndex + 1] ? "Следующая запись" : "Показать результат"}
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
          <Text style={kanaStyles.title}>{activeSet.title}</Text>
          <Text style={kanaStyles.description}>{activeSet.chartDescription}</Text>

          {activeSet.rows.map((row) => (
            <View key={`${activeSet.id}-${row.id}`} style={kanaStyles.chartRow}>
              <Text style={kanaStyles.chartRowTitle}>{row.label}</Text>
              <View style={kanaStyles.chartGrid}>
                {row.symbols.map((symbol) => (
                  <TouchableOpacity
                    key={symbol.id}
                    style={[kanaStyles.kanaCell, isKanaSymbolMastered(progress[symbol.id], symbol) && kanaStyles.kanaCellKnown]}
                    onPress={() => void speakJapanese(symbol.kana)}
                  >
                    <Text style={kanaStyles.kanaGlyph}>{symbol.kana}</Text>
                    <Text style={kanaStyles.kanaRomaji}>{getKanaDisplayRomaji(symbol)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {row.symbols.filter((symbol) => symbol.noteRu).map((symbol) => (
                <Text key={`${symbol.id}-note`} style={kanaStyles.rowNote}>{symbol.kana}: {symbol.noteRu}</Text>
              ))}
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
        <TouchableOpacity style={kanaStyles.backButton} onPress={onBack}>
          <Text style={kanaStyles.backButtonText}>‹ К выбору азбуки</Text>
        </TouchableOpacity>
        <Text style={kanaStyles.eyebrow}>{scriptEyebrow}</Text>
        <Text style={kanaStyles.title}>{scriptTitle}</Text>
        <Text style={kanaStyles.description}>{description}</Text>

        <Text style={kanaStyles.sectionTitle}>Набор для тренировки</Text>
        <View style={kanaStyles.setSelector}>
          {sets.map((set) => (
            <TouchableOpacity
              key={set.id}
              style={[kanaStyles.setSelectorButton, activeSet.id === set.id && kanaStyles.setSelectorButtonActive]}
              onPress={() => setActiveSetId(set.id)}
            >
              <Text style={[kanaStyles.setSelectorTitle, activeSet.id === set.id && kanaStyles.setSelectorTitleActive]}>
                {set.shortTitle}
              </Text>
              <Text style={kanaStyles.setSelectorBody}>{set.body}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={kanaStyles.heroCard}>
          <Text style={kanaStyles.heroKana}>{activeSet.hero}</Text>
          <Text style={kanaStyles.heroTitle}>{summary.mastered} из {summary.total} освоено</Text>
          <Text style={kanaStyles.heroBody}>
            Начато записей: {summary.started}. Общая наполненность применимых навыков: {summary.averagePercent}%.
          </Text>
          <View style={kanaStyles.progressRow}>
            <Text style={kanaStyles.progressLabel}>{activeSet.title}</Text>
            <Text style={kanaStyles.progressValue}>{summary.averagePercent}%</Text>
          </View>
          <View style={kanaStyles.progressTrack}>
            <View style={[kanaStyles.progressFill, { width: `${summary.averagePercent}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("chart")}>
          <Text style={kanaStyles.secondaryButtonText}>Открыть таблицу · {summary.total} записей</Text>
        </TouchableOpacity>

        <Text style={kanaStyles.sectionTitle}>Тренировки набора</Text>
        {skills.map((skill) => (
          <TouchableOpacity key={skill} style={kanaStyles.skillCard} onPress={() => startPractice(skill)}>
            <View style={kanaStyles.skillHeader}>
              <Text style={kanaStyles.skillTitle}>{skillMeta[skill].title}</Text>
              <Text style={kanaStyles.skillPercent}>{getSkillAverage(progress, skill, activeSet.pool)}%</Text>
            </View>
            <Text style={kanaStyles.skillBody}>{skillMeta[skill].body}</Text>
          </TouchableOpacity>
        ))}

        <Text style={kanaStyles.sectionTitle}>Сборка слов</Text>
        <View style={kanaStyles.wordCourseCard}>
          <Text style={kanaStyles.wordCourseKana}>{wordExamples}</Text>
          <Text style={kanaStyles.wordCourseTitle}>{wordSummary.mastered} из {wordSummary.total} слов освоено</Text>
          <Text style={kanaStyles.wordCourseBody}>{wordDescription}</Text>
          <Text style={kanaStyles.wordCourseMeta}>
            Начато: {wordSummary.started} · общий прогресс: {wordSummary.averagePercent}%
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={startWordPractice}>
            <Text style={kanaStyles.primaryButtonText}>Собирать слова</Text>
          </TouchableOpacity>
        </View>

        <Text style={kanaStyles.sectionTitle}>Ключевые правила</Text>
        {rules.map((rule) => (
          <View key={`${scriptTitle}-${rule.title}`} style={kanaStyles.ruleCard}>
            <Text style={kanaStyles.ruleKana}>{rule.kana}</Text>
            <Text style={kanaStyles.ruleTitle}>{rule.title}</Text>
            <Text style={kanaStyles.ruleBody}>{rule.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
