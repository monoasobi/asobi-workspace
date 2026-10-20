import type { CallSection } from "@asobi/content-core/lyrics";

function displayDivisor(pattern: NonNullable<CallSection["clapPattern"]>) {
  let divisor = pattern.subdivision;
  while (divisor > 1 && pattern.steps.some((step) => step % divisor !== 0))
    divisor /= 2;
  return divisor;
}

export function clapSteps(pattern: NonNullable<CallSection["clapPattern"]>) {
  const divisor = displayDivisor(pattern);
  const steps = new Set(pattern.steps.map((step) => step / divisor));
  let display = Array.from(
    { length: (8 * pattern.subdivision) / divisor },
    (_, index) => steps.has(index),
  );
  while (
    display.length > 8 &&
    display
      .slice(0, display.length / 2)
      .every((hit, index) => hit === display[index + display.length / 2])
  )
    display = display.slice(0, display.length / 2);
  return display;
}

export function clapStepAt(section: CallSection, count: number, time: number) {
  const pattern = section.clapPattern;
  if (!pattern || time < section.start || time >= section.end) return -1;
  const elapsed = time - section.start - pattern.firstOffset;
  if (elapsed < 0) return -1;
  const interval =
    (60 / pattern.bpm / pattern.subdivision) * displayDivisor(pattern);
  return Math.floor(elapsed / interval + 1e-7) % count;
}
