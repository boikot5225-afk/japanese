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

import {
  lesson001,
  lesson001Exercises,
  lesson001Grammar,
  lesson001Vocabulary,
} from "./src/content/lesson001";
import { checkAnswer, type AnswerCheckResult } from "./src/engine/checkAnswer";

type Stage = "theory" | "words" | "practice";

const stages: Stage[] = ["theory", "words", "practice"];

export default function App() {
  const [stage, setStage] = useState<Stage>("theory");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerCheckResult | null>(null);

  const inputExercise = useMemo(
    () => lesson001Exercises.find((exercise) => exercise.type === "text-input"),
    [],
  );

  const stageIndex = stages.indexOf(stage);

  const goNext = () => {
    const nextStage = stages[stageIndex + 1];
    if (nextStage) {
      setStage(nextStage);
    }
  };

  const goBack = () => {
    const previousStage = stages[stageIndex - 1];
    if (previousStage) {
      setStage(previousStage);
    }
  };

  const submitAnswer = () => {
    if (!inputExercise || answer.trim().length === 0) {
      return;
    }

    setResult(
      checkAnswer(
        answer,
        inputExercise.correctAnswers,
        inputExercise.acceptableAnswers,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Урок {lesson001.order}</Text>
        <Text style={styles.title}>{lesson001.title}</Text>
        <Text style={styles.description}>{lesson001.description}</Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((stageIndex + 1) / stages.length) * 100}%` },
            ]}
          />
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

        {stage === "practice" && inputExercise && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Практика</Text>
            <View style={styles.card}>
              <Text style={styles.prompt}>{inputExercise.prompt}</Text>
              <TextInput
                value={answer}
                onChangeText={(value) => {
                  setAnswer(value);
                  setResult(null);
                }}
                placeholder="Введите ответ по-японски"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={submitAnswer}>
                <Text style={styles.primaryButtonText}>Проверить</Text>
              </TouchableOpacity>

              {result && (
                <View
                  style={[
                    styles.feedback,
                    result.status === "incorrect"
                      ? styles.feedbackIncorrect
                      : styles.feedbackCorrect,
                  ]}
                >
                  <Text style={styles.feedbackText}>{result.message}</Text>
                  {inputExercise.explanationRu && (
                    <Text style={styles.feedbackExplanation}>
                      {inputExercise.explanationRu}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.navigation}>
          <TouchableOpacity
            disabled={stageIndex === 0}
            onPress={goBack}
            style={[styles.secondaryButton, stageIndex === 0 && styles.disabledButton]}
          >
            <Text style={styles.secondaryButtonText}>Назад</Text>
          </TouchableOpacity>

          {stageIndex < stages.length - 1 && (
            <TouchableOpacity style={styles.primaryButtonSmall} onPress={goNext}>
              <Text style={styles.primaryButtonText}>Дальше</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F3EC",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#9A3D3D",
  },
  title: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    color: "#1C1A18",
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    color: "#5D5852",
  },
  progressTrack: {
    height: 7,
    marginTop: 22,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "#DDD7CE",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#B54444",
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1A18",
  },
  card: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5DED4",
  },
  japaneseTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1C1A18",
  },
  meaning: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#9A3D3D",
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 23,
    color: "#443F3A",
  },
  formula: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#25211E",
    backgroundColor: "#F0ECE5",
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5DED4",
  },
  wordWritten: {
    fontSize: 29,
    fontWeight: "800",
    color: "#1C1A18",
  },
  wordReading: {
    marginTop: 2,
    fontSize: 14,
    color: "#746D65",
  },
  wordMeaning: {
    flexShrink: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    color: "#443F3A",
  },
  prompt: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "800",
    color: "#1C1A18",
  },
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
  primaryButton: {
    alignItems: "center",
    marginTop: 14,
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  feedback: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
  },
  feedbackCorrect: {
    backgroundColor: "#E4F2E8",
  },
  feedbackIncorrect: {
    backgroundColor: "#F7E2E0",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C2824",
  },
  feedbackExplanation: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#514B45",
  },
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
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#38332E",
  },
  disabledButton: {
    opacity: 0.35,
  },
});
