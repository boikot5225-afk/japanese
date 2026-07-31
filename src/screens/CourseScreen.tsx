import { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import {
  findCheckpointForUnit,
  type CourseCheckpoint,
} from "../content/courseCheckpoints";
import { courseUnits, findLessonBundle } from "../content/courseCatalog";
import type { LessonBundle } from "../content/lessonBundle";
import {
  isCheckpointAvailable,
  isCheckpointPassed,
  isLessonUnlocked,
  type CheckpointProgress,
} from "../engine/checkpointEngine";
import { styles } from "../theme/appStyles";
import { kanaStyles } from "../theme/kanaStyles";
import { NumberTrainerScreen } from "./NumberTrainerScreen";

interface CourseScreenProps {
  completedLessonIds: string[];
  checkpointProgress: CheckpointProgress[];
  todayBundle: LessonBundle | undefined;
  dueReviewCount: number;
  weakTargetCount: number;
  nextReviewLabel: string;
  onStartLesson: (bundle: LessonBundle) => void;
  onStartLessonById: (lessonId: string) => void;
  onStartCheckpoint: (checkpoint: CourseCheckpoint) => void;
  onStartReview: () => void;
  onOpenKana: () => void;
}

const russianForm = (count: number, one: string, few: string, many: string): string => {
  if (count % 10 === 1 && count % 100 !== 11) return one;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return few;
  return many;
};

const lessonWord = (count: number): string => russianForm(count, "урок", "урока", "уроков");

export function CourseScreen({
  completedLessonIds,
  checkpointProgress,
  todayBundle,
  dueReviewCount,
  weakTargetCount,
  nextReviewLabel,
  onStartLesson,
  onStartLessonById,
  onStartCheckpoint,
  onStartReview,
  onOpenKana,
}: CourseScreenProps) {
  const [numbersOpen, setNumbersOpen] = useState(false);
  const todayCompleted = todayBundle
    ? completedLessonIds.includes(todayBundle.lesson.id)
    : false;

  if (numbersOpen) {
    return <NumberTrainerScreen onCourse={() => setNumbersOpen(false)} />;
  }

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
                {todayCompleted
                  ? "Повторить пройденное"
                  : completedLessonIds.length === 0
                    ? "Начать сегодня"
                    : "Продолжить"}
              </Text>
              <Text style={styles.timeBadge}>{todayBundle.lesson.estimatedMinutes} мин</Text>
            </View>
            <Text style={styles.todayTitle}>{todayBundle.lesson.title}</Text>
            <Text style={styles.todayBody}>{todayBundle.lesson.description}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onStartLesson(todayBundle)}>
              <Text style={styles.primaryButtonText}>
                {todayCompleted ? "Повторить урок" : "Открыть урок"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={kanaStyles.courseKanaCard}>
          <View style={kanaStyles.courseKanaHeader}>
            <View>
              <Text style={styles.reviewEyebrow}>Письменность</Text>
              <Text style={kanaStyles.courseKanaTitle}>Хирагана и катакана</Text>
            </View>
            <Text style={kanaStyles.courseKanaGlyph}>あ ア</Text>
          </View>
          <Text style={kanaStyles.courseKanaBody}>
            Две азбуки, звук, сложные пары, ввод ромадзи и сборка настоящих слов.
            Прогресс каждого знака хранится отдельно.
          </Text>
          <TouchableOpacity style={kanaStyles.primaryButton} onPress={onOpenKana}>
            <Text style={kanaStyles.primaryButtonText}>Открыть азбуки</Text>
          </TouchableOpacity>
        </View>

        <View style={kanaStyles.courseKanaCard}>
          <View style={kanaStyles.courseKanaHeader}>
            <View>
              <Text style={styles.reviewEyebrow}>Отдельный тренажёр</Text>
              <Text style={kanaStyles.courseKanaTitle}>Числа и счётные слова</Text>
            </View>
            <Text style={kanaStyles.courseKanaGlyph}>一 万</Text>
          </View>
          <Text style={kanaStyles.courseKanaBody}>
            Числа до разряда 万, диктант и счётчики 人・本・枚・個・時・分.
            Прогресс чтения, аудирования и активного ввода хранится отдельно.
          </Text>
          <TouchableOpacity
            style={kanaStyles.primaryButton}
            onPress={() => setNumbersOpen(true)}
          >
            <Text style={kanaStyles.primaryButtonText}>Открыть числительные</Text>
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
              ? `${dueReviewCount} ${russianForm(dueReviewCount, "элемент готов", "элемента готовы", "элементов готовы")} сейчас · слабых знаний: ${weakTargetCount}`
              : `Сейчас очередь пуста. Следующее повторение — ${nextReviewLabel}.`}
          </Text>
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
        {courseUnits.map((unit) => {
          const checkpoint = findCheckpointForUnit(unit.id);
          const checkpointState = checkpoint
            ? checkpointProgress.find((item) => item.checkpointId === checkpoint.id)
            : undefined;
          const checkpointAvailable = checkpoint
            ? isCheckpointAvailable(checkpoint, completedLessonIds)
            : false;
          const checkpointPassed = checkpoint
            ? isCheckpointPassed(checkpoint.id, checkpointProgress)
            : false;

          return (
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
                const unlocked = isLessonUnlocked(
                  lesson.id,
                  completedLessonIds,
                  checkpointProgress,
                );
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lessonRow, !unlocked && styles.disabledButton]}
                    disabled={!bundle || !unlocked}
                    onPress={() => onStartLessonById(lesson.id)}
                  >
                    <View style={[styles.lessonNumber, completed && styles.lessonNumberCompleted]}>
                      <Text style={styles.lessonNumberText}>
                        {completed ? "✓" : unlocked ? lesson.order : "🔒"}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonMeta}>
                        {!unlocked
                          ? "Сначала пройди контрольную точку предыдущего блока"
                          : bundle
                            ? `${bundle.grammar.length} ${russianForm(bundle.grammar.length, "тема", "темы", "тем")} · ${bundle.vocabulary.length} ${russianForm(bundle.vocabulary.length, "слово", "слова", "слов")} · ${bundle.exercises.length} ${russianForm(bundle.exercises.length, "упражнение", "упражнения", "упражнений")}${completed ? " · свободное повторение" : ""}`
                            : "Материал готовится"}
                      </Text>
                    </View>
                    <Text style={styles.lessonChevron}>{unlocked ? "›" : ""}</Text>
                  </TouchableOpacity>
                );
              })}

              {checkpoint && (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewEyebrow}>Рубеж блока</Text>
                      <Text style={styles.reviewTitle}>{checkpoint.title}</Text>
                    </View>
                    <View style={styles.reviewCountBadge}>
                      <Text style={styles.reviewCount}>
                        {checkpointPassed ? "✓" : checkpoint.passPercent}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewBody}>
                    {checkpointPassed
                      ? `Пройдено. Лучший результат: ${checkpointState?.bestPercent ?? checkpoint.passPercent}%. Можно пересдать без потери доступа.`
                      : checkpointAvailable
                        ? `${checkpoint.questionCount} смешанных заданий из всего блока. Для перехода дальше нужно ${checkpoint.passPercent}%.`
                        : "Откроется после завершения всех уроков этого блока."}
                  </Text>
                  <TouchableOpacity
                    disabled={!checkpointAvailable}
                    style={[styles.reviewButton, !checkpointAvailable && styles.disabledButton]}
                    onPress={() => onStartCheckpoint(checkpoint)}
                  >
                    <Text style={styles.reviewButtonText}>
                      {checkpointPassed
                        ? "Пройти ещё раз"
                        : checkpointAvailable
                          ? "Начать проверку"
                          : "Пока закрыто"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
