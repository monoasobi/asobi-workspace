"use client";
import { TextSuggestions } from "./TextSuggestions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CallIcon } from "@asobi/loudasobi-view/common/CallIcon";
import { CustomIconField } from "./CustomIconField";
import { legacyCallIcon } from "@asobi/content-core/callIcons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@asobi/ui/components/accordion";
import { Button } from "@asobi/ui/components/button";
import { Switch } from "@asobi/ui/components/switch";
import { Input } from "@asobi/ui/components/input";
import { Label } from "@asobi/ui/components/label";
import { callLabels } from "@asobi/loudasobi-view/player/GuidePreview/guideStyles";
import type { Playback } from "@asobi/loudasobi-view/player/MusicExperience/usePlayback";
import {
  moveCue,
  resizeCue,
  roundTime,
  changeCueType,
  defaultPulsePattern,
  customCueEffects,
  type CallCue,
} from "@asobi/content-core/callGuide";
import { NumberField } from "./NumberField";
import { PatternEditor } from "./PatternEditor";
import { SingalongTextEditor } from "./SingalongTextEditor";
import type { LyricLine } from "@asobi/content-core/lyrics";

export function CueInspector({
  cue,
  lines,
  defaultBpm,
  sync,
  playback,
  disabled,
  issue,
  onChange,
  onDelete,
  selectedLineCount,
  onLinkLyrics,
}: {
  selectedLineCount: number;
  onLinkLyrics: () => void;
  cue: CallCue;
  lines: LyricLine[];
  defaultBpm?: number;
  sync: number;
  playback: Playback;
  disabled: boolean;
  issue?: string;
  onChange: (cue: CallCue) => void;
  onDelete: () => void;
}) {
  const effects = customCueEffects(cue);
  return (
    <div className="min-w-0 space-y-4 p-4 [overflow-wrap:anywhere]">
      {issue && (
        <p role="alert" className="text-xs text-destructive">
          {issue}
        </p>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || !selectedLineCount}
        onClick={onLinkLyrics}
      >
        선택 블록에 가사 연결 ({selectedLineCount})
      </Button>
      <fieldset disabled={disabled} className="min-w-0 space-y-4">
        <div className="space-y-1.5">
          <p id="cue-type-label" className="text-sm font-medium">
            콜 종류
          </p>
          <div
            role="group"
            aria-labelledby="cue-type-label"
            className="grid grid-cols-4 gap-1 rounded-lg border bg-muted/40 p-1"
          >
            {Object.entries(callLabels).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={cue.type === value ? "default" : "ghost"}
                aria-pressed={cue.type === value}
                disabled={disabled}
                onClick={() =>
                  onChange(
                    changeCueType(cue, value as CallCue["type"], defaultBpm),
                  )
                }
              >
                <CallIcon
                  type={value as CallCue["type"]}
                  icon={cue.icon}
                  emoji={cue.emoji}
                />
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            콜 블록 위치 조절 · 초
          </p>
          <div
            role="group"
            aria-label="콜 블록 위치 조절"
            className="grid grid-cols-6 gap-0.5 rounded-lg border bg-muted/30 p-1"
          >
            {[-0.1, -0.05, -0.01, 0.01, 0.05, 0.1].map((delta) => (
              <Button
                key={delta}
                size="xs"
                variant="ghost"
                className="h-7 min-w-0 gap-0.5 rounded-md px-0.5 text-[10px] tabular-nums"
                aria-label={`${Math.abs(delta).toFixed(2)}초 ${delta < 0 ? "앞으로" : "뒤로"} 이동`}
                title={`${Math.abs(delta).toFixed(2)}초 ${delta < 0 ? "앞으로" : "뒤로"} 이동`}
                disabled={
                  cue.start + sync + delta < 0 ||
                  (playback.duration > 0 &&
                    cue.end + sync + delta > playback.duration)
                }
                onClick={() => onChange(moveCue(cue, delta))}
              >
                {delta < 0 && (
                  <ChevronLeft aria-hidden="true" className="size-3" />
                )}
                {Math.abs(delta).toFixed(2)}
                {delta > 0 && (
                  <ChevronRight aria-hidden="true" className="size-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
        {cue.type === "chant" || cue.type === "custom" ? (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <h3 className="text-sm font-medium">
              {cue.type === "custom" ? "커스텀 표시 문구" : "챈트 내용 / 설명"}
            </h3>
            {cue.type === "chant" && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="챈트 프리셋"
              >
                {[
                  { ko: "어이!", ja: "オイ！", en: "Oi!" },
                  { ko: "헤이!", ja: "ヘイ！", en: "Hey!" },
                ].map((labels) => (
                  <Button
                    key={labels.ko}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() =>
                      onChange({ ...cue, labels, label: labels.ko })
                    }
                  >
                    {labels.ko}
                  </Button>
                ))}
              </div>
            )}
            {(
              [
                { locale: "ko", name: "한국어" },
                { locale: "ja", name: "일본어" },
                { locale: "en", name: "영어" },
              ] as const
            ).map(({ locale, name }) => (
              <div key={locale} className="space-y-1">
                <Label htmlFor={`cue-label-${locale}`}>{name}</Label>
                <Input
                  id={`cue-label-${locale}`}
                  lang={locale}
                  maxLength={200}
                  value={
                    cue.labels?.[locale] ?? (locale === "ko" ? cue.label : "")
                  }
                  onChange={(event) => {
                    const labels = {
                      ...(cue.labels ?? { ko: cue.label, ja: "", en: "" }),
                      [locale]: event.target.value,
                    };
                    onChange({ ...cue, labels, label: labels.ko });
                  }}
                />
              </div>
            ))}
            <TextSuggestions
              kind="call"
              value={cue.labels ?? { ko: cue.label, ja: "", en: "" }}
              disabled={disabled}
              onSelect={(labels) =>
                onChange({ ...cue, labels, label: labels.ko })
              }
            />
          </div>
        ) : null}
        <Accordion type="single" collapsible>
          <AccordionItem value="notes">
            <AccordionTrigger>콜 설명</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 rounded-lg border p-3">
                {(
                  [
                    { locale: "ko", name: "한국어" },
                    { locale: "ja", name: "일본어" },
                    { locale: "en", name: "영어" },
                  ] as const
                ).map(({ locale, name }) => (
                  <div key={locale} className="space-y-1">
                    <Label htmlFor={`cue-note-${locale}`}>{name}</Label>
                    <textarea
                      className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                      id={`cue-note-${locale}`}
                      lang={locale}
                      maxLength={2000}
                      value={cue.notes?.[locale] ?? ""}
                      onChange={(event) =>
                        onChange({
                          ...cue,
                          notes: {
                            ...(cue.notes ?? { ko: "", ja: "", en: "" }),
                            [locale]: event.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
                <TextSuggestions
                  kind="note"
                  value={cue.notes ?? { ko: "", ja: "", en: "" }}
                  disabled={disabled}
                  onSelect={(notes) => onChange({ ...cue, notes })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {cue.type === "singalong" && (
          <SingalongTextEditor
            cue={cue}
            lines={lines}
            disabled={disabled}
            onChange={onChange}
          />
        )}
        {cue.type === "custom" && (
          <CustomIconField
            value={cue.icon ?? legacyCallIcon(cue.emoji)}
            disabled={disabled}
            onChange={(icon) => onChange({ ...cue, icon, emoji: undefined })}
          />
        )}
        {cue.type === "custom" && (
          <div className="space-y-3 rounded-lg border p-3">
            <h3 className="text-sm font-medium">커스텀 효과</h3>
            {(
              [
                { key: "text", label: "글자 띄우기 (챈트처럼)" },
                { key: "flash", label: "칸 반짝이기 (박수처럼)" },
              ] as const
            ).map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3"
              >
                <Label htmlFor={`custom-effect-${key}`}>{label}</Label>
                <Switch
                  id={`custom-effect-${key}`}
                  disabled={disabled}
                  checked={effects[key]}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...cue,
                      customEffects: { ...effects, [key]: checked },
                      pattern:
                        checked && !cue.pattern && !cue.pulseTimes.length
                          ? defaultPulsePattern(defaultBpm)
                          : cue.pattern,
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
        {cue.type !== "singalong" &&
          (cue.type !== "custom" || effects.text || effects.flash) && (
            <PatternEditor
              cue={cue}
              defaultBpm={defaultBpm}
              sync={sync}
              playback={playback}
              disabled={disabled}
              onChange={onChange}
            />
          )}
        <Accordion key={cue.id} type="single" collapsible>
          <AccordionItem value="timing">
            <AccordionTrigger>시작·끝 시간</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="시작 (재생 초)"
                  value={roundTime(cue.start + sync)}
                  min={0}
                  max={cue.end + sync - 0.01}
                  onChange={(value) =>
                    onChange(resizeCue(cue, "start", value - sync))
                  }
                />
                <NumberField
                  label="끝 (재생 초)"
                  value={roundTime(cue.end + sync)}
                  min={cue.start + sync + 0.01}
                  max={playback.duration || 86400}
                  onChange={(value) =>
                    onChange(resizeCue(cue, "end", value - sync))
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          블록 삭제
        </Button>
      </fieldset>
    </div>
  );
}
