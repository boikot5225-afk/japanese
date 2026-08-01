export type SwipeNavigationAction = "back" | "forward" | null;

export interface SwipeNavigationSample {
  startX: number;
  dx: number;
  dy: number;
  velocityX: number;
}

export interface SwipeNavigationOptions {
  allowBack: boolean;
  allowForward: boolean;
  backEdgeOnly?: boolean;
  edgeWidth?: number;
}

const horizontalEnough = (dx: number, dy: number): boolean =>
  Math.abs(dx) >= 12 && Math.abs(dx) > Math.abs(dy) * 1.35;

const directionAllowed = (
  sample: SwipeNavigationSample,
  options: SwipeNavigationOptions,
): boolean => {
  if (sample.dx > 0) {
    if (!options.allowBack) return false;
    if (!options.backEdgeOnly) return true;
    return sample.startX <= (options.edgeWidth ?? 24);
  }
  return sample.dx < 0 && options.allowForward;
};

export function isSwipeNavigationCandidate(
  sample: SwipeNavigationSample,
  options: SwipeNavigationOptions,
): boolean {
  return horizontalEnough(sample.dx, sample.dy) && directionAllowed(sample, options);
}

export function resolveSwipeNavigation(
  sample: SwipeNavigationSample,
  options: SwipeNavigationOptions,
): SwipeNavigationAction {
  if (!isSwipeNavigationCandidate(sample, options)) return null;

  const passedDistance = Math.abs(sample.dx) >= 72;
  const passedVelocity =
    Math.abs(sample.velocityX) >= 0.55 && Math.abs(sample.dx) >= 28;
  if (!passedDistance && !passedVelocity) return null;

  return sample.dx > 0 ? "back" : "forward";
}
