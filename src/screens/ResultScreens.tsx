import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import type { LessonBundle } from "../content/lessonBundle";
import type { LessonResult } from "../engine/lessonSession";
import { styles } from "../theme/appStyles";

interface LessonResultScreenProps {
  result: LessonResult;
  activeBundle: LessonBundle;
  nextBundle: LessonBundle | undefined;
  onNextLesson: () => void;
  onRetry: () => void;
  onCourse: () => void;
}

export function LessonResultScreen({
  result,
  activeBundle,
  nextBundle,
  onNextLesson,
  onRetry,
  onCourse,
}: LessonResultScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{result.passed ? "合格" : "復習"}</Text>
        <Text style={styles.resultTitle}>{result.passed ? "Урок пройден" : "Нужно закрепить"}</Text>
        <Text style={styles.resultPercent}>{result.percent}%</Text>
        <Text style={styles.resultSummary}>Верных ответов: {result.correct} из {result.total}</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>Что изучено</Text>
          {activeBundle.outcomes.map((outcome) => (
            <Text key={outcome} style={styles.resultLine}>• {outcome}</Text>
          ))}
        </View>
        <Text style={styles.reviewScheduledText}>
          Все задания получили дату следующего повторения. Ошибки уже появились в очереди «Повторить сегодня».
        </Text>
        {result.passed && nextBundle && (
          <TouchableOpacity style={styles.primaryButton} onPress={onNextLesson}>
            <Text style={styles.primaryButtonText}>Следующий урок</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={result.passed && nextBundle ? styles.secondaryWideButton : styles.primaryButton}
          onPress={onRetry}
        >
          <Text style={result.passed && nextBundle ? styles.secondaryButtonText : styles.primaryButtonText}>
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

interface ReviewResultScreenProps {
  result: LessonResult;
  dueReviewCount: number;
  onContinueReview: () => void;
  onCourse: () => void;
}

export function ReviewResultScreen({
  result,
  dueReviewCount,
  onContinueReview,
  onCourse,
}: ReviewResultScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultEmoji}>復習</Text>
        <Text style={styles.resultTitle}>Повторение закончено</Text>
        <Text style={styles.resultPercent}>{result.percent}%</Text>
        <Text style={styles.resultSummary}>Верных ответов: {result.correct} из {result.total}</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>Что дальше</Text>
          <Text style={styles.resultLine}>• правильные ответы отложены минимум на день</Text>
          <Text style={styles.resultLine}>• ошибочные задания остались в сегодняшней очереди</Text>
          <Text style={styles.resultLine}>• слабые темы подняты выше в следующей сессии</Text>
        </View>
        {dueReviewCount > 0 && (
          <TouchableOpacity style={styles.primaryButton} onPress={onContinueReview}>
            <Text style={styles.primaryButtonText}>Повторить оставшееся</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.linkButton} onPress={onCourse}>
          <Text style={styles.linkButtonText}>Вернуться к курсу</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
