import { roundTime } from "@/lib/callGuide";

export type LyricSnapTarget = {
  time: number;
  kind: "start" | "end";
  lineIndex: number;
};

// A fixed screen-space distance keeps snapping predictable at every zoom level.
export function snapCueBounds(
  start: number,
  end: number,
  kind: "move" | "start" | "end",
  targets: readonly LyricSnapTarget[],
  scale: number,
  min: number,
  max: number,
) {
  let best:
    | { start: number; end: number; target: LyricSnapTarget; distance: number }
    | undefined;
  for (const target of targets) {
    for (const edge of kind === "move" ? (["start", "end"] as const) : [kind]) {
      const delta = target.time - (edge === "start" ? start : end);
      const nextStart =
        kind === "move" || edge === "start" ? roundTime(start + delta) : start;
      const nextEnd =
        kind === "move" || edge === "end" ? roundTime(end + delta) : end;
      const distance = Math.abs(delta) * scale;
      if (
        distance > 8 ||
        nextStart < min ||
        nextEnd > max ||
        roundTime(nextEnd - nextStart) < 0.01
      )
        continue;
      if (
        !best ||
        distance < best.distance ||
        (distance === best.distance &&
          target.kind === edge &&
          best.target.kind !== edge)
      ) {
        best = { start: nextStart, end: nextEnd, target, distance };
      }
    }
  }
  return best
    ? { start: best.start, end: best.end, snap: best.target }
    : { start, end, snap: undefined };
}
