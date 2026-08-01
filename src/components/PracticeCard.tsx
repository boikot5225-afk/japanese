import { useCallback, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { getExerciseSpeechText } from "../audio/exerciseSpeechText";
import { speakJapanese } from "../audio/japaneseSpeech";
import type { Exercise } from "../domain/course";
import type { AnswerCheckResult } from "../engine/checkAnswer";
import {
  getHandwritingAssessmentAnswer,
  getPracticeInteractionMode,
} from "../engine/practiceInteraction";
import { styles } from "../theme/appStyles";
import { HandwritingPad } from "./HandwritingPad";

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
  const [handwritingHasInk, setHandwritingHasInk] = useState(false);
  const [handwritingCompared, setHandwritingCompared] = useState(false);
  const choices = Array.from(
    new Set([...exercise.correctAnswers, ...(exercise.distractors ?? [])]),
  );
  const isSuccess = result?.status === "correct" || result?.status === "acceptable";
  const displayedAnswer = exercise.correctAnswers[0] ?? "";
  const spokenAudio = getExerciseSpeechText(exercise);
  const interactionMode = getPracticeInteractionMode(exercise);
  const isChoiceExercise = interactionMode === "choice";
  const isTextExercise = interactionMode === "text";

  useEffect(() => {
    setHandwritingHasInk(false);
    setHandwritingCompared(false);
  }, [exercise.id]);

  useEffect(() => {
    if (exercise.type === "listening" && exercise.audioText && !result) {
      void speakJapanese(exercise.audioText);
    }
  }, [exercise.audioText, exercise.id, exercise.type, result]);

  useEffect(() => {
    if (result && isSuccess && spokenAudio) {
      void speakJapanese(spokenAudio);
    }
  }, [isSuccess, result, spokenAudio]);

  const handleInkChange = useCallback((hasInk: boolean) => {
    setHandwritingHasInk(hasInk);
    if (!hasInk) setHandwritingCompared(false);
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.practiceHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.exerciseCounter}>
          {exerciseIndex + 1}/{exerciseCount}
        </Text>
      </View>
      <View style={styles.card}>
        {exercise.sessionRole === "remediation" && (
          <Text style={styles.reviewEyebrow}>Закрепление после ошибки</Text>
        )}
        <Text style={styles.prompt}>{exercise.prompt}</Text>

        {exercise.type === "listening" && exercise.audioText && (
          <TouchableOpacity
            style={styles.secondaryWideButton}
            onPress={() => void speakJapanese(exercise.audioText ?? "")}
          >
            <Text style={styles.secondaryButtonText}>🔊 Прослушать ещё раз</Text>
          </TouchableOpacity>
        )}

        {isChoiceExercise && (
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

        {interactionMode === "builder" && (
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

        {isTextExercise && (
          <TextInput
            value={answer}
            editable={!result}
            onChangeText={onAnswerChange}
            placeholder={
              exercise.type === "particle-gap"
                ? "Введите частицу или частицы"
                : "Введите ответ по-японски"
            }
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        )}

        {interactionMode === "handwriting" && (
          <>
            <HandwritingPad
              key={exercise.id}
              reference={displayedAnswer}
              disabled={Boolean(result)}
              onInkChange={handleInkChange}
              onCompare={() => setHandwritingCompared(true)}
            />
            {!result && handwritingCompared && handwritingHasInk && (
              <View style={styles.choiceList}>
                <Text style={styles.feedbackExplanation}>
                  Сравни с усиленным образцом. Пока без распознавания штрихов оценка ручная — зато приложение не врёт, будто умеет видеть то, чего ещё не проверяет.
                </Text>
                <TouchableOpacity
                  style={styles.choiceButton}
                  onPress={() =>
                    onChoice(getHandwritingAssessmentAnswer(exercise, true))
                  }
                >
                  <Text style={styles.choiceText}>Похоже на образец</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.choiceButton}
                  onPress={() =>
                    onChoice(getHandwritingAssessmentAnswer(exercise, false))
                  }
                >
                  <Text style={styles.choiceText}>Нужно повторить</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {!result &&
          (interactionMode === "text" || interactionMode === "builder") && (
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
                  Ответ: {displayedAnswer || "—"}
                </Text>
              )}
              {spokenAudio && (
                <TouchableOpacity
                  style={styles.listenAnswerButton}
                  onPress={() => void speakJapanese(spokenAudio)}
                >
                  <Text style={styles.listenAnswerText}>🔊 Прослушать предложение</Text>
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
