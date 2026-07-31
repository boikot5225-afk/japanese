import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import { courseUnits, findLessonBundle } from "../content/courseCatalog";
import type { LessonBundle } from "../content/lessonBundle";
import { styles } from "../theme/appStyles";
import { kanaStyles } from "../theme/kanaStyles";

interface CourseScreenProps {
  completedLessonIds: string[];
  todayBundle: LessonBundle | undefined;
  dueReviewCount: number;
  weakTargetCount: number;
  attemptCount: number;
  nextReviewLabel: string;
  onStartLesson: (bundle: LessonBundle) => void;
  onStartLessonById: (lessonId: string) => void;
  onStartReview: () => void;
  onOpenKana: () => void;
}

const lessonWord = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return "урок";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "урока";
  return "уроков";
};

export function CourseScreen({
  completedLessonIds,
  todayBundle,
  dueReviewCount,
  weakTargetCount,
  attemptCount,
  nextReviewLabel,
  onStartLesson,
  onStartLessonById,
  onStartReview,
  onOpenKana,
}: CourseScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>日本語 · Japanese</Text>
        <Text style={styles.heroTitle}>Японский с нуля до чтения</Text>
        <Text style={styles.description}>
          Последовательный курс с грамматикой, открытыми ответами и повторением,
          а не бесконечная свалка карточек.
        </Text>

        {todayBundle && (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todaySectionTitle}>
                {completedLessonIds.length === 0 ? "Начать сегодня" : "Продолжить"}
              </Text>
              <Text style={styles.timeBadge}>{todayBundle.lesson.estimatedMinutes} мин</Text>
            </View>
            <Text style={styles.todayTitle}>{todayBundle.lesson.title}</Text>
            <Text style={styles.todayBody}>{todayBundle.lesson.description}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onStartLesson(todayBundle)}>
              <Text style={styles.primaryButtonText}>Открыть урок</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={kanaStyles.courseKanaCard}>
          <View style={kanaStyles.courseKanaHeader}>
            <View>
              <Text style={styles.reviewEyebrow}>Азбука</Text>
              <Text style={kanaStyles.courseKanaTitle}>Хирагана · 46 знаков</Text>
            </View>
            <Text style={kanaStyles.courseKanaGlyph}>あ</Text>
          </View>
          <Text style={kanaStyles.courseKanaBody}>
            Таблица со звуком и отдельные тренировки на узнавание, чтение, слух и ввод ромадзи.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={onOpenKana}>
            <Text style={kanaStyles.primaryButtonText}>Открыть хирагану</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.reviewEyebrow}>Повторение</Text>
              <Text style={styles.reviewTitle}>Закрепить слабые места</Text>
            </View>
            <View style={styles.reviewCountBadge}>
              <Text style={styles.reviewCount}>{dueReviewCount}</Text>
            </View>
          </View>
          <Text style={styles.reviewBody}>
            {dueReviewCount > 0
              ? `${dueReviewCount} заданий готовы сейчас · слабых элементов: ${weakTargetCount}`
              : `Сейчас очередь пуста. Следующее повторение — ${nextReviewLabel}.`}
          </Text>
          <Text style={styles.reviewHistory}>История: {attemptCount} попыток</Text>
          <TouchableOpacity
            disabled={dueReviewCount === 0}
            style={[styles.reviewButton, dueReviewCount === 0 && styles.disabledButton]}
            onPress={onStartReview}
          >
            <Text style={styles.reviewButtonText}>
              {dueReviewCount > 0 ? "Повторить сегодня" : "Пока нечего повторять"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, styles.courseHeading]}>Курс</Text>
        {courseUnits.map((unit) => (
          <View key={unit.id} style={styles.unitCard}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitLevel}>{unit.jlptLevel}</Text>
              <Text style={styles.unitCount}>{unit.lessons.length} {lessonWord(unit.lessons.length)}</Text>
            </View>
            <Text style={styles.unitTitle}>{unit.title}</Text>
            <Text style={styles.body}>{unit.description}</Text>

            {unit.lessons.map((lesson) => {
              const bundle = findLessonBundle(lesson.id);
              const completed = completedLessonIds.includes(lesson.id);
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonRow}
                  disabled={!bundle}
                  onPress={() => onStartLessonById(lesson.id)}
                >
                  <View style={[styles.lessonNumber, completed && styles.lessonNumberCompleted]}>
                    <Text style={styles.lessonNumberText}>{completed ? "✓" : lesson.order}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonMeta}>
                      {bundle
                        ? `${bundle.grammar.length} темы · ${bundle.vocabulary.length} слова · ${bundle.exercises.length} упражнения`
                        : "Материал готовится"}
                    </Text>
                  </View>
                  <Text style={styles.lessonChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
