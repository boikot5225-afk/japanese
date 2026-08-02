import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Exercise, KanjiItem } from "../domain/course";
import type { KanjiProgressSummary } from "../engine/kanjiProgress";
import {
  buildKanjiStudyQuestions,
  checkKanjiStudyAnswer,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";

interface KanjiStudyPanelProps {
  item: KanjiItem;
  catalog: readonly KanjiItem[];
  exercises: readonly Exercise[];
  progress: KanjiProgressSummary;
  strokeCount: number | null;
  onRecord: (result: KanjiStudyResult) => void;
}

const statusMessage = (correct: boolean): string =>
  correct
    ? "Верно. Связь записана в интервальное повторение."
    : "Пока нет. Посмотри объяснение: это знание вернётся в ближайшее повторение.";

export function KanjiStudyPanel({
  item,
  catalog,
  exercises,
  progress,
  strokeCount,
  onRecord,
}: KanjiStudyPanelProps) {
  const questions = useMemo(
    () => buildKanjiStudyQuestions(item, exercises, catalog),
    [catalog, exercises, item],
  );
  const [phase, setPhase] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"correct" | "acceptable" | "incorrect" | null>(null);
  const question = phase >= 0 ? questions[phase] : undefined;
  const complete = phase >= questions.length;
  const example = item.examples[0];

  const resetAnswer = () => {
    setAnswer("");
    setStatus(null);
  };

  const submit = (value: string) => {
    if (!question || status || value.trim().length === 0) return;
    const nextStatus = checkKanjiStudyAnswer(question, value);
    setAnswer(value);
    setStatus(nextStatus);
    if (question.recordResult) {
      onRecord({
        questionId: question.id,
        exercise: question.exercise,
        answer: value,
        status: nextStatus,
      });
    }
  };

  if (phase < 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.glyphBox}>
            <Text style={styles.glyph}>{item.literal}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Первое изучение</Text>
            <Text style={styles.title}>Свяжи знак со знакомым словом</Text>
            <Text style={styles.meta}>
              {strokeCount ? `${strokeCount} черт · ` : ""}значение {progress.meaning.mastery}% · чтение {progress.reading.mastery}%
            </Text>
          </View>
        </View>

        <View style={styles.memoryCard}>
          <Text style={styles.memoryLabel}>Образ</Text>
          <Text style={styles.memoryText}>
            {item.literal} — {item.meaningsRu.join(", ")}. Сначала запомни общий образ,
            затем закрепи конкретное чтение только внутри слова.
          </Text>
        </View>

        {example && (
          <View style={styles.wordCard}>
            <Text style={styles.word}>{example.written}</Text>
            <Text style={styles.reading}>{example.reading}</Text>
            <Text style={styles.meaning}>{example.meaningRu}</Text>
            <Text style={styles.focus}>
              В этом слове {item.literal} читается {example.kanjiReading}.
            </Text>
          </View>
        )}

        <Text style={styles.note}>
          Цикл короткий: узнавание значения → подсказанное чтение → чтение без вариантов.
          После него переходи к письму ниже.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase(0)}>
          <Text style={styles.primaryButtonText}>
            {progress.meaning.attempts + progress.reading.attempts > 0
              ? "Повторить значение и чтение"
              : "Начать изучение"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (complete) {
    return (
      <View style={[styles.card, styles.completeCard]}>
        <Text style={styles.eyebrow}>Этап завершён</Text>
        <Text style={styles.title}>Значение и чтение записаны</Text>
        <Text style={styles.note}>
          Теперь напиши {item.literal} в тренажёре ниже. Все три навыка хранятся раздельно,
          поэтому знакомое значение не маскирует слабое письмо или чтение.
        </Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setPhase(-1);
            resetAnswer();
          }}
        >
          <Text style={styles.secondaryButtonText}>Пройти цикл ещё раз</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!question) return null;
  const successful = status === "correct" || status === "acceptable";

  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.eyebrow}>{question.title}</Text>
        <Text style={styles.stepCounter}>{phase + 1}/{questions.length}</Text>
      </View>
      <Text style={styles.question}>{question.prompt}</Text>

      {question.choices.length > 0 ? (
        <View style={styles.choices}>
          {question.choices.map((choice) => {
            const selected = answer === choice;
            return (
              <TouchableOpacity
                key={choice}
                disabled={Boolean(status)}
                style={[
                  styles.choice,
                  selected && (successful ? styles.choiceCorrect : styles.choiceIncorrect),
                ]}
                onPress={() => submit(choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <TextInput
            value={answer}
            editable={!status}
            onChangeText={setAnswer}
            onSubmitEditing={() => submit(answer)}
            placeholder="Введи чтение хираганой"
            placeholderTextColor="#7b8794"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {!status && (
            <TouchableOpacity
              style={[styles.primaryButton, answer.trim().length === 0 && styles.disabled]}
              disabled={answer.trim().length === 0}
              onPress={() => submit(answer)}
            >
              <Text style={styles.primaryButtonText}>Проверить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {status && (
        <View style={[styles.feedback, successful ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={styles.feedbackTitle}>{statusMessage(successful)}</Text>
          <Text style={styles.feedbackBody}>{question.exercise.explanationRu}</Text>
          {!question.recordResult && (
            <Text style={styles.guidedNote}>
              Это была подсказанная ступень: в SRS попадёт следующий ответ без вариантов.
            </Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPhase((current) => current + 1);
              resetAnswer();
            }}
          >
            <Text style={styles.primaryButtonText}>
              {phase + 1 >= questions.length ? "Перейти к письму" : "Дальше"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#cbd9e3",
    borderRadius: 20,
    backgroundColor: "#f8fbfd",
  },
  completeCard: { borderColor: "#9bc9ae", backgroundColor: "#f0faf4" },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  glyphBox: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#e7eef5",
  },
  glyph: { color: "#15202b", fontSize: 48, fontWeight: "500" },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { color: "#31546f", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { color: "#15202b", fontSize: 20, lineHeight: 26, fontWeight: "900" },
  meta: { color: "#66788a", fontSize: 13, lineHeight: 18 },
  memoryCard: { gap: 4, padding: 13, borderRadius: 15, backgroundColor: "#fff4d8" },
  memoryLabel: { color: "#7a4f00", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  memoryText: { color: "#59420f", fontSize: 14, lineHeight: 21 },
  wordCard: { gap: 2, padding: 14, borderRadius: 16, backgroundColor: "#ffffff" },
  word: { color: "#15202b", fontSize: 25, fontWeight: "900" },
  reading: { color: "#31546f", fontSize: 16 },
  meaning: { color: "#66788a", fontSize: 14 },
  focus: { marginTop: 5, color: "#183153", fontSize: 14, lineHeight: 20, fontWeight: "800" },
  note: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  primaryButton: { alignItems: "center", paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "#183153" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  secondaryButton: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#9eb0bf", borderRadius: 14, backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#183153", fontSize: 14, fontWeight: "800" },
  stepHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  stepCounter: { color: "#66788a", fontSize: 13, fontWeight: "800" },
  question: { color: "#15202b", fontSize: 18, lineHeight: 25, fontWeight: "800" },
  choices: { gap: 9 },
  choice: { paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: "#c7d3dd", borderRadius: 14, backgroundColor: "#ffffff" },
  choiceCorrect: { borderColor: "#3e9b6a", backgroundColor: "#e7f7ee" },
  choiceIncorrect: { borderColor: "#c85454", backgroundColor: "#fdecec" },
  choiceText: { color: "#15202b", fontSize: 16, fontWeight: "700" },
  inputGroup: { gap: 10 },
  input: { paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: "#c7d3dd", borderRadius: 14, backgroundColor: "#ffffff", color: "#15202b", fontSize: 17 },
  disabled: { opacity: 0.45 },
  feedback: { gap: 9, padding: 13, borderRadius: 15 },
  feedbackCorrect: { backgroundColor: "#e7f7ee" },
  feedbackIncorrect: { backgroundColor: "#fdecec" },
  feedbackTitle: { color: "#15202b", fontSize: 14, lineHeight: 20, fontWeight: "900" },
  feedbackBody: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  guidedNote: { color: "#31546f", fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
