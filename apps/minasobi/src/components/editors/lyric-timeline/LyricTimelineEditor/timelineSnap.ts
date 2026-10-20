// Keep the snap distance constant on screen, regardless of zoom.
export function snapTimelineDelta(
  delta: number,
  edges: readonly number[],
  target: number,
  pixelsPerSecond: number,
  min: number,
  max: number,
  disabled = false,
) {
  let result = Math.min(max, Math.max(min, delta));
  let distance = Infinity;
  if (!disabled) {
    for (const edge of edges) {
      const candidate = target - edge;
      const nextDistance = Math.abs(candidate - delta) * pixelsPerSecond;
      if (candidate < min || candidate > max || nextDistance > 8) continue;
      if (nextDistance < distance) {
        distance = nextDistance;
        result = candidate;
      }
    }
  }
  return Number(result.toFixed(2));
}
