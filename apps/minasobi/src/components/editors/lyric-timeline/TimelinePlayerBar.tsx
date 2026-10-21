"use client";
import { useState } from "react";
import {
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Volume2,
} from "lucide-react";
import { Button } from "@asobi/ui/components/button";
import { ButtonGroup } from "@asobi/ui/components/button-group";
import { Slider } from "@asobi/ui/components/slider";
import type { LyricPlayer } from "../playback/useLyricPlayer";
import { formatTime } from "@asobi/content-core/lyricTime";

export function TimelinePlayerBar({
  player,
  title,
}: {
  player: LyricPlayer;
  title: string;
}) {
  const [scrub, setScrub] = useState<number | null>(null);
  return (
    <footer
      className="shrink-0 border-t bg-background px-4 py-3"
      aria-label="음원 플레이어"
    >
      <div className="mx-auto flex max-w-[900px] items-center gap-3">
        <Button
          size="icon"
          className="size-11"
          onClick={player.togglePlay}
          aria-label={player.shouldPlay ? "일시정지" : "재생"}
        >
          {player.shouldPlay ? <Pause /> : <Play />}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium">{title}</span>
            <span className="text-muted-foreground">
              {player.shouldPlay ? "재생 중" : "일시정지"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] tabular-nums">
              {formatTime(scrub ?? player.currentTime)}
            </span>
            <Slider
              min={0}
              max={player.duration || 1}
              step={0.01}
              disabled={player.duration <= 0}
              value={[
                Math.min(scrub ?? player.currentTime, player.duration || 1),
              ]}
              onValueChange={([value]) => setScrub(value ?? 0)}
              onValueCommit={([value]) => {
                player.seek(value ?? 0);
                setScrub(null);
              }}
              aria-label="재생 위치"
            />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatTime(player.duration)}
            </span>
          </div>
        </div>
        <ButtonGroup aria-label="미세 탐색">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => player.seekBy(-0.01)}
            disabled={player.currentTime <= 0}
            aria-label="0.01초 이전으로 이동"
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => player.seekBy(0.01)}
            disabled={
              player.duration > 0 && player.currentTime >= player.duration
            }
            aria-label="0.01초 이후로 이동"
          >
            <ChevronRight />
          </Button>
        </ButtonGroup>
        <Button
          size="icon"
          variant="ghost"
          onClick={player.toggleMute}
          aria-label={player.effectiveVolume === 0 ? "음소거 해제" : "음소거"}
        >
          {player.effectiveVolume === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
        <Slider
          className="w-20"
          min={0}
          max={1}
          step={0.01}
          value={[player.effectiveVolume]}
          onValueChange={([value]) => player.changeVolume(value ?? 0)}
          aria-label="볼륨"
        />
      </div>
    </footer>
  );
}
