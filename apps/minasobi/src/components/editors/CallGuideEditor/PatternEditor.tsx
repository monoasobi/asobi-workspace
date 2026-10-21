"use client";
import { useSyncExternalStore } from "react";
import { ButtonGroup } from "@asobi/ui/components/button-group";
import { Button } from "@asobi/ui/components/button";
import { Label } from "@asobi/ui/components/label";
import { Checkbox } from "@asobi/ui/components/checkbox";
import {
  NativeSelect,
  NativeSelectOption,
} from "@asobi/ui/components/native-select";
import type { Playback } from "@asobi/loudasobi-view/player/MusicExperience/usePlayback";
import {
  cuePulses,
  defaultPulsePattern,
  resizeCue,
  roundTime,
  type CallCue,
} from "@asobi/content-core/callGuide";
import { NumberField } from "./NumberField";

export function PatternEditor({
  cue,
  defaultBpm,
  sync,
  playback,
  disabled,
  onChange,
}: {
  cue: CallCue;
  defaultBpm?: number;
  sync: number;
  playback: Playback;
  disabled: boolean;
  onChange: (cue: CallCue) => void;
}) {
  const now =
    useSyncExternalStore(
      playback.clock.subscribeProgress,
      playback.clock.getProgress,
      playback.clock.getServerProgress,
    ) - sync;
  const pattern = cue.pattern ?? defaultPulsePattern(defaultBpm);
  const beats = pattern.beats ?? 8;
  const pulses = cuePulses(cue);
  const trimmedEnd = pulses.length
    ? Math.min(cue.end, roundTime(Math.max(cue.start, ...pulses) + 0.01))
    : cue.end;
  const patch = (change: Partial<NonNullable<CallCue["pattern"]>>) =>
    pattern &&
    onChange({ ...cue, pattern: { ...pattern, ...change }, pulseTimes: [] });
  const step = pattern
    ? Math.floor(
        (now - cue.start - pattern.firstOffset) /
          (60 / pattern.bpm / pattern.subdivision),
      )
    : -1;
  return (
    <div className="space-y-3">
      {pattern && (
        <>
          <ButtonGroup aria-label="반복 패턴 길이">
            {([8, 16] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={beats === value ? "secondary" : "outline"}
                aria-pressed={beats === value}
                disabled={disabled}
                onClick={() => {
                  if (value === beats) return;
                  const count = 8 * pattern.subdivision;
                  patch({
                    beats: value,
                    steps:
                      value === 16
                        ? [
                            ...pattern.steps,
                            ...pattern.steps.map((step) => step + count),
                          ]
                        : pattern.steps.filter((step) => step < count),
                  });
                }}
              >
                {value}박
              </Button>
            ))}
          </ButtonGroup>
          <div className="grid gap-2">
            <NumberField
              label="BPM"
              value={pattern.bpm}
              min={20}
              max={400}
              step={0.1}
              onChange={(bpm) => patch({ bpm })}
            />
          </div>
          <Label htmlFor="pulse-subdivision">박 세분화</Label>
          <NativeSelect
            id="pulse-subdivision"
            value={pattern.subdivision}
            onChange={(event) =>
              patch({
                subdivision: Number(event.target.value) as 1 | 2 | 4,
                steps: pattern.steps
                  .map(
                    (value) =>
                      (value * Number(event.target.value)) /
                      pattern.subdivision,
                  )
                  .filter(Number.isInteger),
              })
            }
          >
            <NativeSelectOption
              value={1}
            >{`1박 단위 · ${beats}칸`}</NativeSelectOption>
            <NativeSelectOption
              value={2}
            >{`반박 단위 · ${beats * 2}칸`}</NativeSelectOption>
            <NativeSelectOption
              value={4}
            >{`¼박 단위 · ${beats * 4}칸`}</NativeSelectOption>
          </NativeSelect>
          <div
            className="grid grid-cols-4 gap-2 sm:grid-cols-8"
            aria-label="펄스 카운트"
          >
            {Array.from({ length: beats * pattern.subdivision }, (_, index) => (
              <label
                key={index}
                className={`flex min-h-8 flex-col items-center justify-center gap-1 rounded border p-1 text-xs ${now >= cue.start && now < cue.end && step >= 0 && step % (beats * pattern.subdivision) === index ? "bg-primary/20 ring-2 ring-primary" : "bg-card"}`}
              >
                <Checkbox
                  disabled={disabled}
                  checked={pattern.steps.includes(index)}
                  aria-label={`${Math.floor(index / pattern.subdivision) + 1}${index % pattern.subdivision ? `박 +${(index % pattern.subdivision) / pattern.subdivision}` : "박"}`}
                  onCheckedChange={(checked) =>
                    patch({
                      steps: checked
                        ? [...pattern.steps, index].sort((a, b) => a - b)
                        : pattern.steps.filter((value) => value !== index),
                    })
                  }
                />
              </label>
            ))}
          </div>
        </>
      )}
      <div className="space-y-1">
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={disabled || trimmedEnd >= cue.end}
          onClick={() => onChange(resizeCue(cue, "end", trimmedEnd))}
        >
          마지막 펄스 직후로 자르기
        </Button>
      </div>
    </div>
  );
}
