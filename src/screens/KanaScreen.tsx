import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import { SwipeNavigationView } from "../components/SwipeNavigationView";
import { createKnownKanaProgress, type KanaProgressMap } from "../engine/kanaEngine";
import type { KanaWordProgressMap } from "../engine/kanaWordEngine";
import {
  hiraganaRowsBySet,
  hiraganaUnitsBySet,
  type KanaSetId,
} from "../kana/hiragana";
import { kanaWords } from "../kana/kanaWords";
import {
  basicKatakana,
  katakanaRowsBySet,
  katakanaUnitsBySet,
  type KatakanaSetId,
} from "../kana/katakana";
import { katakanaWords } from "../kana/katakanaWords";
import {
  loadKanaProgress,
  loadKanaWordProgress,
  loadLearnerProfile,
  saveKanaProgress,
  saveKanaWordProgress,
} from "../storage/learnerStorage";
import { kanaStyles } from "../theme/kanaStyles";
import {
  KanaTrainerScreen,
  type KanaRuleCard,
  type KanaTrainingSet,
} from "./KanaTrainerScreen";

interface KanaScreenProps {
  onCourse: () => void;
}

type ActiveScript = "hiragana" | "katakana" | null;

const hiraganaMeta: Record<
  KanaSetId,
  Omit<KanaTrainingSet, "id" | "rows" | "pool">
> = {
  basic: {
    title: "Базовая хирагана",
    shortTitle: "46 базовых",
    body: "Основные записи от あ до ん.",
    hero: "あいうえお",
    chartDescription:
      "Нажми на запись, чтобы услышать её. Зелёным отмечены освоенные элементы. を не проверяется на слух отдельно от お.",
  },
  voiced: {
    title: "Дакутэн и хандакутэн",
    shortTitle: "Дакутэн и P",
    body: "Ряды が／ざ／だ／ば и ряд ぱ.",
    hero: "がざだばぱ",
    chartDescription:
      "Знак ゛ создаёт звонкие ряды, а ゜ — ряд P. ぢ и づ в стандартной речи совпадают по звучанию с じ и ず.",
  },
  contracted: {
    title: "Сочетания с маленькой каной",
    shortTitle: "ゃゅょ",
    body: "きゃ, しゅ, ちょ и другие сочетания ёон.",
    hero: "きゃしゅちょ",
    chartDescription:
      "Маленькие ゃ／ゅ／ょ соединяются с предыдущей каной в одну мору. Большая や／ゆ／よ читалась бы отдельно.",
  },
};

const hiraganaSetIds: readonly KanaSetId[] = ["basic", "voiced", "contracted"];
const hiraganaSets: readonly KanaTrainingSet[] = hiraganaSetIds.map((id) => ({
  id,
  ...hiraganaMeta[id],
  rows: hiraganaRowsBySet[id],
  pool: hiraganaUnitsBySet[id],
}));

const katakanaMeta: Record<
  KatakanaSetId,
  Omit<KanaTrainingSet, "id" | "rows" | "pool">
> = {
  basic: {
    title: "Базовая катакана",
    shortTitle: "46 базовых",
    body: "Основные записи от ア до ン.",
    hero: "アイウエオ",
    chartDescription:
      "Катакана передаёт те же моры, что и хирагана, но используется прежде всего для заимствований, имён, звукоподражаний и выделения.",
  },
  voiced: {
    title: "Дакутэн и хандакутэн",
    shortTitle: "Дакутэн и P",
    body: "Ряды ガ／ザ／ダ／バ и ряд パ.",
    hero: "ガザダバパ",
    chartDescription:
      "Правила те же, что в хирагане. ヂ и ヅ нельзя честно отличить на слух от ジ и ズ без контекста.",
  },
  contracted: {
    title: "Сочетания с маленькой каной",
    shortTitle: "ャュョ",
    body: "キャ, シュ, チョ и другие сочетания.",
    hero: "キャシュチョ",
    chartDescription:
      "Маленькие ャ／ュ／ョ образуют одну мору с предыдущим знаком: キャ — kya, а キヤ читалось бы ki-ya.",
  },
  loan: {
    title: "Современные звуки заимствований",
    shortTitle: "フォ・ティ・ヴ",
    body: "Сочетания для звуков, которых нет в базовой таблице.",
    hero: "フォティヴ",
    chartDescription:
      "Маленькие гласные позволяют приблизить иностранное произношение: フォ — fo, ティ — ti. Это не обычные сочетания ёон.",
  },
  contrast: {
    title: "Сложные пары катаканы",
    shortTitle: "シツ・ソン",
    body: "Отдельная тренировка похожих начертаний.",
    hero: "シツソン",
    chartDescription:
      "Сравнивай направление коротких штрихов и место начала длинного штриха. Не пытайся запоминать эти четыре знака только по общему силуэту.",
  },
};

const katakanaSetIds: readonly KatakanaSetId[] = [
  "basic",
  "voiced",
  "contracted",
  "loan",
  "contrast",
];
const katakanaSets: readonly KanaTrainingSet[] = katakanaSetIds.map((id) => ({
  id,
  ...katakanaMeta[id],
  rows: katakanaRowsBySet[id],
  pool: katakanaUnitsBySet[id],
}));

const hiraganaRules: readonly KanaRuleCard[] = [
  {
    kana: "か → が · は → ば／ぱ",
    title: "Дакутэн и хандакутэн",
    body: "Знак ゛ обычно образует звонкий ряд. Кружок ゜ ставится на кане ряда H и создаёт ряд P.",
  },
  {
    kana: "き + ゃ = きゃ",
    title: "Маленькие ゃ／ゅ／ょ",
    body: "Они соединяются с предыдущей каной в одну мору: kya, shu, cho. Большая кана образовала бы отдельную мору.",
  },
  {
    kana: "きて ≠ きって",
    title: "Маленькая っ",
    body: "Она обозначает короткую задержку перед следующим согласным. В ромадзи это обычно показывают удвоением.",
  },
  {
    kana: "こう · きょう",
    title: "Долгие гласные",
    body: "В хирагане долгота часто записывается дополнительной う или い. Конкретное написание лучше запоминать внутри слова.",
  },
];

const katakanaRules: readonly KanaRuleCard[] = [
  {
    kana: "コーヒー · スーパー",
    title: "Знак долготы ー",
    body: "Черта удлиняет гласную предыдущей моры и не читается как самостоятельный звук. Поэтому コヒ и コーヒー звучат по-разному.",
  },
  {
    kana: "チケト ≠ チケット",
    title: "Маленькая ッ",
    body: "Она создаёт задержку перед следующим согласным. В ромадзи это обычно отражается удвоением: chiketto.",
  },
  {
    kana: "ニ + ュ = ニュ",
    title: "Маленькие ャ／ュ／ョ",
    body: "Они соединяются с предыдущим знаком в одну мору. ニュ — nyu, а ニユ читалось бы ni-yu.",
  },
  {
    kana: "フ + ォ = フォ",
    title: "Маленькие гласные",
    body: "В заимствованиях маленькие ァ／ィ／ェ／ォ помогают передавать иностранные звуки: フォ — fo, ティ — ti.",
  },
  {
    kana: "シ／ツ · ソ／ン",
    title: "Похожие начертания",
    body: "Смотри на направление коротких штрихов и траекторию длинного. Специальный набор тренирует только эти четыре знака.",
  },
];

export function KanaScreen({ onCourse }: KanaScreenProps) {
  const [activeScript, setActiveScript] = useState<ActiveScript>(null);
  const [progress, setProgress] = useState<KanaProgressMap>({});
  const [wordProgress, setWordProgress] = useState<KanaWordProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const [storedKana, storedWords, profile] = await Promise.all([
        loadKanaProgress(),
        loadKanaWordProgress(),
        loadLearnerProfile(),
      ]);
      if (cancelled) return;
      const seededKana =
        profile?.startLevel === "kana"
          ? { ...createKnownKanaProgress(basicKatakana), ...storedKana }
          : storedKana;
      setProgress(seededKana);
      setWordProgress(storedWords);
      setHydrated(true);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveKanaProgress(progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (hydrated) void saveKanaWordProgress(wordProgress);
  }, [hydrated, wordProgress]);

  if (!hydrated) {
    return (
      <SafeAreaView style={kanaStyles.safeArea}>
        <View style={kanaStyles.centeredContainer}>
          <Text style={kanaStyles.loadingText}>Загружаю прогресс азбук…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (activeScript === "hiragana") {
    return (
      <SwipeNavigationView onBack={() => setActiveScript(null)}>
        <KanaTrainerScreen
          key="hiragana"
          scriptTitle="Хирагана"
          scriptEyebrow="Азбука · плавные формы"
          description="Базовые записи, дакутэн, хандакутэн, сочетания ёон и орфография настоящих японских слов."
          sets={hiraganaSets}
          words={kanaWords}
          wordExamples="がっこう · しゃしん · きっぷ"
          wordDescription="Собирай слова из отдельных знаков. Большие и маленькие варианты перемешиваются, а ошибки получают приоритет."
          rules={hiraganaRules}
          progress={progress}
          wordProgress={wordProgress}
          onProgressChange={setProgress}
          onWordProgressChange={setWordProgress}
          onBack={() => setActiveScript(null)}
        />
      </SwipeNavigationView>
    );
  }

  if (activeScript === "katakana") {
    return (
      <SwipeNavigationView onBack={() => setActiveScript(null)}>
        <KanaTrainerScreen
          key="katakana"
          scriptTitle="Катакана"
          scriptEyebrow="Азбука · заимствования"
          description="Базовые знаки, сложные пары, долгота ー, маленькая ッ и современные сочетания для иностранных слов."
          sets={katakanaSets}
          words={katakanaWords}
          wordExamples="コーヒー · チケット · コンピューター"
          wordDescription="Собирай слова-заимствования, различай シ／ツ и ソ／ン и учись видеть долготу и маленькую кану внутри слова."
          rules={katakanaRules}
          progress={progress}
          wordProgress={wordProgress}
          onProgressChange={setProgress}
          onWordProgressChange={setWordProgress}
          onBack={() => setActiveScript(null)}
        />
      </SwipeNavigationView>
    );
  }

  return (
    <SwipeNavigationView onBack={onCourse}>
      <SafeAreaView style={kanaStyles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={kanaStyles.container}>
          <TouchableOpacity style={kanaStyles.backButton} onPress={onCourse}>
            <Text style={kanaStyles.backButtonText}>‹ К основному курсу</Text>
          </TouchableOpacity>
          <Text style={kanaStyles.eyebrow}>Письменность</Text>
          <Text style={kanaStyles.title}>Хирагана и катакана</Text>
          <Text style={kanaStyles.description}>
            Две азбуки используют один движок навыков, но хранят прогресс по каждому знаку отдельно.
            Выбери систему, которую хочешь изучать или повторять.
          </Text>

          <View style={kanaStyles.courseKanaCard}>
            <View style={kanaStyles.courseKanaHeader}>
              <View>
                <Text style={kanaStyles.courseKanaTitle}>Хирагана</Text>
                <Text style={kanaStyles.courseKanaBody}>Японские окончания, частицы и обычные слова.</Text>
              </View>
              <Text style={kanaStyles.courseKanaGlyph}>あ</Text>
            </View>
            <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => setActiveScript("hiragana")}>
              <Text style={kanaStyles.primaryButtonText}>Открыть хирагану</Text>
            </TouchableOpacity>
          </View>

          <View style={kanaStyles.courseKanaCard}>
            <View style={kanaStyles.courseKanaHeader}>
              <View>
                <Text style={kanaStyles.courseKanaTitle}>Катакана</Text>
                <Text style={kanaStyles.courseKanaBody}>Заимствования, имена, бренды и звукоподражания.</Text>
              </View>
              <Text style={kanaStyles.courseKanaGlyph}>ア</Text>
            </View>
            <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => setActiveScript("katakana")}>
              <Text style={kanaStyles.primaryButtonText}>Открыть катакану</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SwipeNavigationView>
  );
}
