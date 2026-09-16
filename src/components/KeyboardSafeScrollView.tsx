import { type PropsWithChildren, useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type KeyboardSafeScrollViewProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function KeyboardSafeScrollView({
  children,
  contentContainerStyle,
}: KeyboardSafeScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardVisibleRef = useRef(false);

  const revealBottom = () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 90);
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const showSubscription = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true;
      revealBottom();
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisibleRef.current = false;
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={internalStyles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[contentContainerStyle, internalStyles.keyboardClearance]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        onContentSizeChange={() => {
          if (keyboardVisibleRef.current) revealBottom();
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const internalStyles = StyleSheet.create({
  flex: { flex: 1 },
  keyboardClearance: { paddingBottom: 140 },
});
