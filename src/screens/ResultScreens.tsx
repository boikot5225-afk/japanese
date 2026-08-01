import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import { SwipeNavigationView } from "../components/SwipeNavigationView";
import type { LessonBundle } from "../content/lessonBundle";
import type { LessonRunMode } from "../engine/lessonReview";
import type { LessonResult } from "../engine/lessonSession";
import { styles } from "../theme/appStyles";

interface LessonResultScreenProps {
  result: LessonResult;
  activeBundle: LessonBundle;
  nextBundle: LessonBundle | undefined;
  mode: LessonRunMode;
  onNextLesson: () => void;
  onRetry: () => void;
  onCourse: () => void;
}

export function LessonResultScreen({
  result,
  activeBundle,
  nextBundle,
  mode,
  onNextLesson,
  onRetry,
  onCourse,
}: LessonResultScreenProps) {
  const isPractice = mode === "practice";
  const title = isPractice
    ? "Повторение урока закончено"
    : result.passed
      ? "Урок пройден"
      : "Нужно закрепить";
  const scheduleMessage = isPractice
    ? "Это была свободная практика: она не изменила сроки интервального повторения."
    : result.passed
      ? "Задания урока добавлены в интервальное повторение. Первый срок — через день, а ошибки поднимутся выше в очереди."
      : "Урок пока не добавлен в долгосрочную очередь. Сначала заверши его успешно, чтобы незаконченный материал не засорял повторение.";

  return (
    <SwipeNavigationView onBack={onCourse}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{result.passed ? "合格" : "復習"}</Text>
          <Text style={styles.resultTitle}>{title}</Text>
          <Text style={styles.resultPercent}>{result.percent}%</Text>
          <Text style={styles.resultSummary}>Верных ответов: {result.correct} из {result.total}</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>{isPractice ? "Что повторено" : "Что изучено"}</Text>
            {activeBundle.outcomes.map((outcome) => (
              <Text key={outcome} style={styles.resultLine}>• {outcome}</Text>
            ))}
          </View>
          <Text style={styles.reviewScheduledText}>{scheduleMessage}</Text>
          {!isPractice && result.passed && nextBundle && (
            <TouchableOpacity style={styles.primaryButton} onPress={onNextLesson}>
              <Text style={styles.primaryButtonText}>Следующий урок</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={!isPractice && result.passed && nextBundle ? styles.secondaryWideButton : styles.primaryButton}
            onPress={onRetry}
          >
            <Text style={!isPractice && result.passed && nextBundle ? styles.secondaryButtonText : styles.primaryButtonText}>
              Повторить ещё раз
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={onCourse}>
            <Text style={styles.linkButtonText}>Вернуться к курсу</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SwipeNavigationView>
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
    <SwipeNavigationView onBack={onCourse}>
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
    </SwipeNavigationView>
  );
}
