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
import {
  createKanaWordSession,
  createWordTokenPool,
  getKanaWordSummary,
  isKanaWordAnswerCorrect,
  updateKanaWordProgress,
  type KanaWordProgressMap,
} from "../engine/kanaWordEngine";
import {
  hiraganaRowsBySet,
  hiraganaUnitsBySet,
  type KanaSetId,
} from "../kana/hiragana";
import type { KanaWord } from "../kana/kanaWords";
import {
  loadKanaProgress,
  loadKanaWordProgress,
  saveKanaProgress,
  saveKanaWordProgress,
} from "../storage/learnerStorage";
import { kanaStyles } from "../theme/kanaStyles";

interface KanaScreenProps {
  onCourse: () => void;
}

type KanaView =
  | "home"
  | "chart"
  | "practice"
  | "result"
  | "word-practice"
  | "word-result";

const skillMeta: Record<KanaSkill, { title: string; body: string }> = {
  recognition: {
    title: "Узнавание знака",
    body: "Увидь ромадзи и выбери соответствующий знак или сочетание.",
  },
  reading: {
    title: "Чтение",
    body: "Увидь японскую запись и выбери её чтение.",
  },
  listening: {
    title: "Аудирование",
    body: "Услышь слог и найди правильную запись.",
  },
  typing: {
    title: "Самостоятельный ответ",
    body: "Увидь запись и введи ромадзи без вариантов.",
  },
};

const setMeta: Record<
  KanaSetId,
  { title: string; shortTitle: string; body: string; hero: string; chartDescription: string }
> = {
  basic: {
    title: "Базовая хирагана",
    shortTitle: "46 базовых",
    body: "Основные знаки от あ до ん.",
    hero: "あいうえお",
    chartDescription:
      "Нажми на знак, чтобы услышать его. Зелёным отмечены записи, освоенные во всех четырёх навыках.",
  },
  voiced: {
    title: "Дакутэн и хандакутэн",
    shortTitle: "Звонкие",
    body: "が／ざ／だ／ば и ряд ぱ с кружком.",
    hero: "がざだばぱ",
    chartDescription:
      "Две черты ゛ делают согласный звонким, а кружок ゜ превращает ряд H в ряд P. ぢ и づ редки и отдельно помечены.",
  },
  contracted: {
    title: "Сочетания с маленькой каной",
    shortTitle: "ゃゅょ",
    body: "きゃ, しゅ, ちょ и другие слитные слоги.",
    hero: "きゃしゅちょ",
    chartDescription:
      "Маленькие ゃ／ゅ／ょ соединяются с предыдущим знаком в один слог. Это не два самостоятельных слога.",
  },
};

const skills: KanaSkill[] = ["recognition", "reading", "listening", "typing"];
const kanaSets: KanaSetId[] = ["basic", "voiced", "contracted"];

const countAvailableTokens = (pool: string[], selected: string[]): string[] => {
  const selectedCounts = new Map<string, number>();
  selected.forEach((token) => {
    selectedCounts.set(token, (selectedCounts.get(token) ?? 0) + 1);
  });
  return pool.filter((token) => {
    const count = selectedCounts.get(token) ?? 0;
    if (count <= 0) return true;
    selectedCounts.set(token, count - 1);
    return false;
  });
};

export function KanaScreen({ onCourse }: KanaScreenProps) {
  const [view, setView] = useState<KanaView>("home");
  const [activeSet, setActiveSet] = useState<KanaSetId>("basic");
  const [progress, setProgress] = useState<KanaProgressMap>({});
  const [wordProgress, setWordProgress] = useState<KanaWordProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
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

  const currentQuestion = questions[questionIndex];
  const currentWord = wordQueue[wordIndex];
  const activePool = hiraganaUnitsBySet[activeSet];
  const activeRows = hiraganaRowsBySet[activeSet];
  const summary = useMemo(
    () => getKanaMasterySummary(progress, activePool),
    [activePool, progress],
  );
  const wordSummary = useMemo(() => getKanaWordSummary(wordProgress), [wordProgress]);
  const wordTokenPool = useMemo(
    () => (currentWord ? createWordTokenPool(currentWord) : []),
    [currentWord],
  );
  const availableWordTokens = useMemo(
    () => countAvailableTokens(wordTokenPool, selectedWordTokens),
    [selectedWordTokens, wordTokenPool],
  );

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const [storedKana, storedWords] = await Promise.all([
        loadKanaProgress(),
        loadKanaWordProgress(),
      ]);
      if (!cancelled) {
        setProgress(storedKana);
        setWordProgress(storedWords);
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
    if (!hydrated) return;
    void saveKanaWordProgress(wordProgress);
  }, [hydrated, wordProgress]);

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

  const resetWordQuestion = () => {
    setSelectedWordTokens([]);
    setWordResult(null);
  };

  const startPractice = (skill: KanaSkill) => {
    setActiveSkill(skill);
    setQuestions(createKanaSession(skill, progress, 10, activePool));
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

  const startWordPractice = () => {
    setWordQueue(createKanaWordSession(wordProgress, 8));
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
    setWordProgress((previous) => updateKanaWordProgress(previous, currentWord.id, correct));
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
      return;
    }
    setView("word-result");
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

  if (view === "word-result") {
    const percent =
      wordQueue.length === 0 ? 0 : Math.round((wordCorrectCount / wordQueue.length) * 100);
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.eyebrow}>Слова · результат</Text>
          <Text style={kanaStyles.resultPercent}>{percent}%</Text>
          <Text style={kanaStyles.resultTitle}>
            {percent >= 80 ? "Слова складываются" : "Нужно ещё закрепить"}
          </Text>
          <Text style={kanaStyles.resultBody}>
            Правильных сборок: {wordCorrectCount} из {wordQueue.length}. Ошибочные слова один раз
            возвращались в конец этой же сессии.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={startWordPractice}>
            <Text style={kanaStyles.primaryButtonText}>Повторить слова</Text>
          </TouchableOpacity>
          <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("home")}>
            <Text style={kanaStyles.secondaryButtonText}>К разделу хираганы</Text>
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
          <Text style={kanaStyles.eyebrow}>Маленькая кана в словах</Text>
          <View style={kanaStyles.questionCard}>
            <Text style={kanaStyles.counter}>
              {wordIndex + 1} / {wordQueue.length}
            </Text>
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
              {availableWordTokens.map((token, index) => (
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
                <TouchableOpacity
                  style={kanaStyles.clearWordButton}
                  onPress={() => setSelectedWordTokens([])}
                >
                  <Text style={kanaStyles.clearWordButtonText}>Очистить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={kanaStyles.primaryButtonCompact} onPress={submitWord}>
                  <Text style={kanaStyles.primaryButtonText}>Проверить</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View
                  style={[
                    kanaStyles.feedback,
                    wordResult ? kanaStyles.feedbackCorrect : kanaStyles.feedbackIncorrect,
                  ]}
                >
                  <Text style={kanaStyles.feedbackText}>{wordResult ? "Верно" : "Пока нет"}</Text>
                  <Text style={kanaStyles.wordCorrectAnswer}>
                    {currentWord.kana} · {currentWord.romaji}
                  </Text>
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
          <Text style={kanaStyles.eyebrow}>{setMeta[activeSet].shortTitle} · результат</Text>
          <Text style={kanaStyles.resultPercent}>{percent}%</Text>
          <Text style={kanaStyles.resultTitle}>
            {percent >= 80 ? "Хорошая серия" : "Есть что закрепить"}
          </Text>
          <Text style={kanaStyles.resultBody}>
            Правильных ответов: {correctCount} из {questions.length}. Ошибочные записи получили
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
          <Text style={kanaStyles.eyebrow}>
            {setMeta[activeSet].shortTitle} · {skillMeta[activeSkill].title}
          </Text>
          <View style={kanaStyles.questionCard}>
            <Text style={kanaStyles.counter}>
              {questionIndex + 1} / {questions.length}
            </Text>
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
                  {currentQuestion.noteRu && (
                    <Text style={kanaStyles.feedbackAnswer}>{currentQuestion.noteRu}</Text>
                  )}
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
          <Text style={kanaStyles.title}>{setMeta[activeSet].title}</Text>
          <Text style={kanaStyles.description}>{setMeta[activeSet].chartDescription}</Text>

          {activeRows.map((row) => (
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
              {row.symbols
                .filter((symbol) => symbol.noteRu)
                .map((symbol) => (
                  <Text key={`${symbol.id}-note`} style={kanaStyles.rowNote}>
                    {symbol.kana}: {symbol.noteRu}
                  </Text>
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
        <TouchableOpacity style={kanaStyles.backButton} onPress={onCourse}>
          <Text style={kanaStyles.backButtonText}>‹ К основному курсу</Text>
        </TouchableOpacity>
        <Text style={kanaStyles.eyebrow}>Азбука</Text>
        <Text style={kanaStyles.title}>Хирагана</Text>
        <Text style={kanaStyles.description}>
          Теперь здесь есть базовые знаки, звонкие ряды, слитные сочетания и сборка настоящих
          слов.
        </Text>

        <Text style={kanaStyles.sectionTitle}>Набор для тренировки</Text>
        <View style={kanaStyles.setSelector}>
          {kanaSets.map((setId) => (
            <TouchableOpacity
              key={setId}
              style={[
                kanaStyles.setSelectorButton,
                activeSet === setId && kanaStyles.setSelectorButtonActive,
              ]}
              onPress={() => setActiveSet(setId)}
            >
              <Text
                style={[
                  kanaStyles.setSelectorTitle,
                  activeSet === setId && kanaStyles.setSelectorTitleActive,
                ]}
              >
                {setMeta[setId].shortTitle}
              </Text>
              <Text style={kanaStyles.setSelectorBody}>{setMeta[setId].body}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={kanaStyles.heroCard}>
          <Text style={kanaStyles.heroKana}>{setMeta[activeSet].hero}</Text>
          <Text style={kanaStyles.heroTitle}>
            {summary.mastered} из {summary.total} освоено
          </Text>
          <Text style={kanaStyles.heroBody}>
            Начато записей: {summary.started}. Общая наполненность навыков: {summary.averagePercent}%.
          </Text>
          <View style={kanaStyles.progressRow}>
            <Text style={kanaStyles.progressLabel}>{setMeta[activeSet].title}</Text>
            <Text style={kanaStyles.progressValue}>{summary.averagePercent}%</Text>
          </View>
          <View style={kanaStyles.progressTrack}>
            <View style={[kanaStyles.progressFill, { width: `${summary.averagePercent}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={kanaStyles.secondaryButton} onPress={() => setView("chart")}>
          <Text style={kanaStyles.secondaryButtonText}>
            Открыть таблицу · {summary.total} записей
          </Text>
        </TouchableOpacity>

        <Text style={kanaStyles.sectionTitle}>Тренировки набора</Text>
        {skills.map((skill) => (
          <TouchableOpacity key={skill} style={kanaStyles.skillCard} onPress={() => startPractice(skill)}>
            <View style={kanaStyles.skillHeader}>
              <Text style={kanaStyles.skillTitle}>{skillMeta[skill].title}</Text>
              <Text style={kanaStyles.skillPercent}>
                {getSkillAverage(progress, skill, activePool)}%
              </Text>
            </View>
            <Text style={kanaStyles.skillBody}>{skillMeta[skill].body}</Text>
          </TouchableOpacity>
        ))}

        <Text style={kanaStyles.sectionTitle}>Сборка слов</Text>
        <View style={kanaStyles.wordCourseCard}>
          <Text style={kanaStyles.wordCourseKana}>がっこう · しゃしん · きっぷ</Text>
          <Text style={kanaStyles.wordCourseTitle}>
            {wordSummary.mastered} из {wordSummary.total} слов освоено
          </Text>
          <Text style={kanaStyles.wordCourseBody}>
            Собирай слова из отдельных знаков. Большая и маленькая кана специально смешиваются,
            чтобы нельзя было угадать форму по силуэту.
          </Text>
          <Text style={kanaStyles.wordCourseMeta}>
            Начато: {wordSummary.started} · общий прогресс: {wordSummary.averagePercent}%
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={startWordPractice}>
            <Text style={kanaStyles.primaryButtonText}>Собирать слова</Text>
          </TouchableOpacity>
        </View>

        <Text style={kanaStyles.sectionTitle}>Ключевые правила</Text>
        <View style={kanaStyles.ruleCard}>
          <Text style={kanaStyles.ruleKana}>か → が · は → ば／ぱ</Text>
          <Text style={kanaStyles.ruleTitle}>Дакутэн и хандакутэн</Text>
          <Text style={kanaStyles.ruleBody}>
            Две черты ゛ озвончают согласный. Кружок ゜ используется только с рядом H и создаёт
            звуки P.
          </Text>
        </View>
        <View style={kanaStyles.ruleCard}>
          <Text style={kanaStyles.ruleKana}>き + ゃ = きゃ</Text>
          <Text style={kanaStyles.ruleTitle}>Маленькие ゃ／ゅ／ょ</Text>
          <Text style={kanaStyles.ruleBody}>
            Они не читаются отдельно, а соединяются с предыдущим знаком в один слог: kya, shu,
            cho.
          </Text>
        </View>
        <View style={kanaStyles.ruleCard}>
          <Text style={kanaStyles.ruleKana}>きて ≠ きって</Text>
          <Text style={kanaStyles.ruleTitle}>Маленькая っ</Text>
          <Text style={kanaStyles.ruleBody}>
            Она создаёт короткую паузу и обычно удваивает следующий согласный: kite и kitte —
            разные слова.
          </Text>
        </View>
        <View style={kanaStyles.ruleCard}>
          <Text style={kanaStyles.ruleKana}>こう · きょう</Text>
          <Text style={kanaStyles.ruleTitle}>Долгие гласные</Text>
          <Text style={kanaStyles.ruleBody}>
            После слога на o буква う часто удлиняет гласный. В ромадзи это можно увидеть как ou
            или как ō.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
