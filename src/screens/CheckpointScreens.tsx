import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import { PracticeCard } from "../components/PracticeCard";
import type { CourseCheckpoint } from "../content/courseCheckpoints";
import type { Exercise } from "../domain/course";
import type { AnswerCheckResult } from "../engine/checkAnswer";
import type { CheckpointProgress, CheckpointResult } from "../engine/checkpointEngine";
import { styles } from "../theme/appStyles";

interface CheckpointScreenProps {
  checkpoint: CourseCheckpoint;
  currentExercise: Exercise;
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
  onCourse: () => void;
}

export function CheckpointScreen({
  checkpoint,
  currentExercise,
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
  onCourse,
}: CheckpointScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backLink} onPress={onCourse}>
          <Text style={styles.backLinkText}>‹ Прервать проверку</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Контрольная точка</Text>
        <Text style={styles.title}>{checkpoint.title}</Text>
        <Text style={styles.description}>{checkpoint.description}</Text>
        <Text style={styles.caution}>
          Для перехода дальше нужно набрать не меньше {checkpoint.passPercent}%. Ошибки попадут в повторение, но попытки не ограничены.
        </Text>
        <PracticeCard
          title="Проверка знаний"
          finishLabel="Показать результат"
          exercise={currentExercise}
          exerciseIndex={exerciseIndex}
          exerciseCount={exerciseCount}
          answer={answer}
          selectedTokens={selectedTokens}
          availableBuilderTokens={availableBuilderTokens}
          result={result}
          onAnswerChange={onAnswerChange}
          onChoice={onChoice}
          onToken={onToken}
          onRemoveToken={onRemoveToken}
          onClearTokens={onClearTokens}
          onSubmit={onSubmit}
          onContinue={onContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface CheckpointResultScreenProps {
  checkpoint: CourseCheckpoint;
  result: CheckpointResult;
  progress: CheckpointProgress | undefined;
  nextLessonTitle?: string;
  onNextLesson: () => void;
  onRetry: () => void;
  onCourse: () => void;
}

export function CheckpointResultScreen({
  checkpoint,
  result,
  progress,
  nextLessonTitle,
  onNextLesson,
  onRetry,
  onCourse,
}: CheckpointResultScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{result.passed ? "突破" : "再挑戦"}</Text>
        <Text style={styles.resultTitle}>
          {result.passed ? "Контрольная точка пройдена" : "Порог пока не взят"}
        </Text>
        <Text style={styles.resultPercent}>{result.percent}%</Text>
        <Text style={styles.resultSummary}>
          Верных ответов: {result.correct} из {result.total} · нужно {checkpoint.passPercent}%
        </Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>Что это значит</Text>
          {result.passed ? (
            <>
              <Text style={styles.resultLine}>• следующий блок курса разблокирован</Text>
              <Text style={styles.resultLine}>• ошибки уже отправлены в интервальное повторение</Text>
              <Text style={styles.resultLine}>• лучший результат: {progress?.bestPercent ?? result.percent}%</Text>
            </>
          ) : (
            <>
              <Text style={styles.resultLine}>• следующий блок остаётся закрыт</Text>
              <Text style={styles.resultLine}>• ошибочные знания подняты в очереди повторения</Text>
              <Text style={styles.resultLine}>• можно повторить слабые темы и сразу пересдать</Text>
            </>
          )}
        </View>
        {result.passed && nextLessonTitle && (
          <TouchableOpacity style={styles.primaryButton} onPress={onNextLesson}>
            <Text style={styles.primaryButtonText}>Открыть: {nextLessonTitle}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={result.passed && nextLessonTitle ? styles.secondaryWideButton : styles.primaryButton}
          onPress={onRetry}
        >
          <Text style={result.passed && nextLessonTitle ? styles.secondaryButtonText : styles.primaryButtonText}>
            Пройти ещё раз
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={onCourse}>
          <Text style={styles.linkButtonText}>Вернуться к курсу</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
