"use client";
import { Languages, LocateFixed, Minus, Plus } from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@asobi/ui/components/button-group";
import { Checkbox } from "@asobi/ui/components/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@asobi/ui/components/popover";
import {
  lyricTextLabels,
  type LyricTextField,
} from "@asobi/content-core/lyricText";

export function TimelineTools({
  scale,
  minScale,
  maxScale,
  zoom,
  onCenter,
  fields,
  selectedFields,
  onFieldsChange,
}: {
  scale: number;
  minScale: number;
  maxScale: number;
  zoom: (scale: number) => void;
  onCenter: () => void;
  fields: readonly LyricTextField[];
  selectedFields: readonly LyricTextField[];
  onFieldsChange: (fields: LyricTextField[]) => void;
}) {
  return (
    <div className="pointer-events-none absolute right-4 bottom-4 z-30 flex flex-col items-end gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="pointer-events-auto rounded-full bg-background shadow-md"
            aria-label="타임라인 표시 언어"
            title="표시 언어"
          >
            <Languages className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-editor-portal
          side="left"
          align="end"
          aria-label="타임라인 표시 언어"
          className="w-52 gap-3 p-4"
        >
          <h2 className="text-sm font-semibold">표시 언어</h2>
          {fields.map((field) => (
            <label key={field} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={selectedFields.includes(field)}
                onCheckedChange={(checked) =>
                  onFieldsChange(
                    fields.filter((item) =>
                      item === field
                        ? checked === true
                        : selectedFields.includes(item),
                    ),
                  )
                }
              />
              {lyricTextLabels[field]}
            </label>
          ))}
        </PopoverContent>
      </Popover>
      <Button
        size="icon"
        variant="outline"
        className="pointer-events-auto rounded-full bg-background shadow-md"
        aria-label="재생 위치로"
        title="재생 위치로"
        onClick={onCenter}
      >
        <LocateFixed className="size-4" />
      </Button>
      <div className="pointer-events-auto rounded-lg bg-background shadow-md">
        <ButtonGroup aria-label="타임라인 확대와 축소">
          <Button
            size="xs"
            variant="outline"
            aria-label="축소"
            title="축소"
            disabled={scale <= minScale}
            onClick={() => zoom(scale / 1.25)}
          >
            <Minus className="size-4" />
          </Button>
          <ButtonGroupText className="text-xs tabular-nums">
            {scale}px/s
          </ButtonGroupText>
          <Button
            size="xs"
            variant="outline"
            aria-label="확대"
            title="확대"
            disabled={scale >= maxScale}
            onClick={() => zoom(scale * 1.25)}
          >
            <Plus className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
