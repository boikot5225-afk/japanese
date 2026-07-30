import { useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import type { Exercise } from "../domain/course";
import type { AnswerCheckResult } from "../engine/checkAnswer";
import { styles } from "../theme/appStyles";

interface PracticeCardProps {
  title: string;
  finishLabel: string;
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

export function PracticeCard({
  title,
  finishLabel,
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
  const spokenAnswer = exercise.correctAnswers[0] ?? "";

  useEffect(() => {
    if (result && isSuccess && spokenAnswer) {
      void speakJapanese(spokenAnswer);
    }
  }, [isSuccess, result, spokenAnswer]);

  return (
    <View style={styles.section}>
      <View style={styles.practiceHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
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
                  Ответ: {spokenAnswer || "—"}
                </Text>
              )}
              {spokenAnswer && (
                <TouchableOpacity
                  style={styles.listenAnswerButton}
                  onPress={() => void speakJapanese(spokenAnswer)}
                >
                  <Text style={styles.listenAnswerText}>🔊 Прослушать ответ</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
              <Text style={styles.primaryButtonText}>
                {exerciseIndex + 1 === exerciseCount ? finishLabel : "Следующее"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
