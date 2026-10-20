"use client";
import { Button } from "@asobi/ui/components/button";

import { Slider } from "@asobi/ui/components/slider";
import {
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Volume2,
} from "lucide-react";

import type { LyricPlayer } from "@/components/editors/playback/useLyricPlayer";
import { LyricOverlay } from "@/components/editors/playback/LyricOverlay";

import ReactPlayer from "react-player";
import styles from "./LyricTimelineEditor.module.css";
import { formatTime } from "./time";

export const TimelineYouTubePreview = ({ player }: { player: LyricPlayer }) => {
  const {
    currentTime,
    duration,
    shouldPlay,
    togglePlay,
    seekBy,
    effectiveVolume,
    toggleMute,
    changeVolume,
    activeLine,
    showJp,
    showReading,
  } = player;

  return (
    <div className={styles.preview}>
      <div className={styles.previewFrame}>
        <div className={styles.previewIframeWrapper}>
          <ReactPlayer {...player.playerProps} />
        </div>
        <div className={styles.previewBlocker} onClick={togglePlay} />
        <div className={styles.previewOverlay}>
          <LyricOverlay
            line={activeLine}
            showJp={showJp}
            showReading={showReading}
            classes={{
              jp: styles.previewOverlayJp,
              reading: styles.previewOverlayReading,
              kr: styles.previewOverlayKr,
            }}
          />
        </div>
      </div>
      <div
        className={[styles.previewControls, "flex items-center gap-2"].join(
          " ",
        )}
      >
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={togglePlay}
        >
          {shouldPlay ? (
            <Pause width="14" height="14" />
          ) : (
            <Play width="14" height="14" />
          )}
          {shouldPlay ? "일시정지" : "재생"}
        </Button>
        <span className="text-muted-foreground text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="flex items-center gap-1">
          <span title="0.01초 이전">
            <Button
              type="button"
              size="sm"
              variant="secondary"

              onClick={() => seekBy(-0.01)}
              disabled={currentTime <= 0}
              aria-label="0.01초 이전으로 이동"
            >
              <ChevronLeft width="14" height="14" />
            </Button>
          </span>
          <span title="0.01초 이후">
            <Button
              type="button"
              size="sm"
              variant="secondary"

              onClick={() => seekBy(0.01)}
              disabled={duration > 0 && currentTime >= duration}
              aria-label="0.01초 이후로 이동"
            >
              <ChevronRight width="14" height="14" />
            </Button>
          </span>
        </div>
        <div
          className={[styles.volumeControl, "flex items-center gap-2"].join(
            " ",
          )}
        >
          <span title={effectiveVolume === 0 ? "음소거 해제" : "음소거"}>
            <Button
              type="button"
              size="sm"
              variant="secondary"

              onClick={toggleMute}
              aria-label={effectiveVolume === 0 ? "음소거 해제" : "음소거"}
            >
              {effectiveVolume === 0 ? (
                <VolumeX width="14" height="14" />
              ) : (
                <Volume2 width="14" height="14" />
              )}
            </Button>
          </span>
          <Slider
            className={styles.volumeSlider}
            value={[effectiveVolume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([value]) => changeVolume(value ?? 0)}
            aria-label="볼륨"
          />
          <span
            className={[
              styles.volumeValue,
              "text-muted-foreground text-xs",
            ].join(" ")}
          >
            {Math.round(effectiveVolume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
};
