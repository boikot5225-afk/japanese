import type { PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";
import { BackHandler, PanResponder, StyleSheet, View } from "react-native";

import {
  isSwipeNavigationCandidate,
  resolveSwipeNavigation,
} from "../engine/swipeNavigation";

interface SwipeNavigationViewProps extends PropsWithChildren {
  onBack?: () => void;
  onForward?: () => void;
  backEdgeOnly?: boolean;
  disabled?: boolean;
}

export function SwipeNavigationView({
  children,
  onBack,
  onForward,
  backEdgeOnly = true,
  disabled = false,
}: SwipeNavigationViewProps) {
  const options = useMemo(
    () => ({
      allowBack: Boolean(onBack) && !disabled,
      allowForward: Boolean(onForward) && !disabled,
      backEdgeOnly,
    }),
    [backEdgeOnly, disabled, onBack, onForward],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          isSwipeNavigationCandidate(
            {
              startX: gesture.x0,
              dx: gesture.dx,
              dy: gesture.dy,
              velocityX: gesture.vx,
            },
            options,
          ),
        onPanResponderRelease: (_, gesture) => {
          const action = resolveSwipeNavigation(
            {
              startX: gesture.x0,
              dx: gesture.dx,
              dy: gesture.dy,
              velocityX: gesture.vx,
            },
            options,
          );
          if (action === "back") onBack?.();
          if (action === "forward") onForward?.();
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [onBack, onForward, options],
  );

  useEffect(() => {
    if (!onBack || disabled) return undefined;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [disabled, onBack]);

  return (
    <View style={styles.root} {...responder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
