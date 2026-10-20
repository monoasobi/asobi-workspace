"use client";

import { LyricOverlay } from "./LyricOverlay";
import { usePlayerFullscreen } from "./VideoPlayer/usePlayerFullscreen";
import type { LyricPlayer } from "./YouTubeLyricsPlayer/useLyricPlayer";
import { formatTime } from "@asobi/content-core/lyricTime";
import {
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import styles from "./VideoPlayer.module.css";

export const VideoPlayer = ({ player }: { player: LyricPlayer }) => {
  const {
    currentTime,
    duration,
    shouldPlay,
    seek,
    togglePlay,
    effectiveVolume,
    changeVolume,
    showJp,
    showReading,
    toggleJp,
    toggleReading,
    activeLine,
  } = player;
  const volumeWrapperRef = useRef<HTMLDivElement>(null);
  const {
    dialogRef,
    containerRef,
    buttonRef,
    isExpanded,
    toggleFullscreen,
    cancelExpanded,
  } = usePlayerFullscreen();
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);

  const handleVolumeButtonClick = () => {
    setShowVolumeTooltip((prev) => !prev);
  };

  useEffect(() => {
    if (!showVolumeTooltip) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        volumeWrapperRef.current &&
        !volumeWrapperRef.current.contains(e.target as Node)
      ) {
        setShowVolumeTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showVolumeTooltip]);

  const seekPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePct = effectiveVolume * 100;

  return (
    <dialog
      ref={dialogRef}
      className={styles.playerDialog}
      open
      aria-label="영상 및 가사 플레이어"
      onCancel={(event) => {
        if (!event.currentTarget.matches(":modal")) return;
        event.preventDefault();
        cancelExpanded();
      }}
    >
      <div
        ref={containerRef}
        className={styles.videoSection}
        data-expanded={isExpanded}
        role={isExpanded ? "region" : undefined}
        aria-label={isExpanded ? "영상 및 가사 전체화면" : undefined}
      >
        <div className={styles.videoFrame}>
          <div className={styles.iframeWrapper}>
            <ReactPlayer {...player.playerProps} />
          </div>
          <div className={styles.videoBlocker} onClick={togglePlay} />
          <div className={styles.videoGradientOverlay} />
          <div className={styles.videoTopControls}>
            <button
              className={styles.overlayToggleBtn}
              type="button"
              data-active={showJp}
              onClick={toggleJp}
            >
              일어
            </button>
            <button
              className={styles.overlayToggleBtn}
              type="button"
              data-active={showReading}
              onClick={toggleReading}
            >
              발음
            </button>
          </div>
          {activeLine && (
            <div className={styles.videoLyricsOverlay}>
              <LyricOverlay
                line={activeLine}
                showJp={showJp}
                showReading={showReading}
                classes={{
                  jp: styles.overlayJp,
                  reading: styles.overlayReading,
                  kr: styles.overlayKr,
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.controls}>
          <button
            className={styles.controlBtn}
            type="button"
            onClick={togglePlay}
            aria-label={shouldPlay ? "일시정지" : "재생"}
          >
            {shouldPlay ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className={styles.timeText}>{formatTime(currentTime)}</span>
          <input
            className={styles.seekInput}
            type="range"
            aria-label="재생 위치"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => seek(Number(event.target.value))}
            style={{
              backgroundImage: `linear-gradient(to right, var(--red-9) ${seekPct.toFixed(1)}%, rgba(255,255,255,0.15) ${seekPct.toFixed(1)}%)`,
            }}
          />
          <span className={styles.timeText}>{formatTime(duration)}</span>
          <div className={styles.volumeWrapper} ref={volumeWrapperRef}>
            <button
              className={styles.controlBtn}
              type="button"
              onClick={handleVolumeButtonClick}
              aria-label="볼륨 조절"
            >
              {effectiveVolume === 0 ? <SpeakerXMarkIcon /> : <SpeakerWaveIcon />}
            </button>
            <div className={styles.volumeTooltip} data-show={showVolumeTooltip}>
              <input
                className={styles.verticalVolumeInput}
                type="range"
                aria-label="볼륨"
                tabIndex={showVolumeTooltip ? 0 : -1}
                min={0}
                max={1}
                step={0.01}
                value={effectiveVolume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                style={{
                  backgroundImage: `linear-gradient(to right, var(--red-9) ${volumePct.toFixed(1)}%, rgba(255,255,255,0.15) ${volumePct.toFixed(1)}%)`,
                }}
              />
            </div>
          </div>
          <button
            ref={buttonRef}
            className={styles.controlBtn}
            type="button"
            onClick={toggleFullscreen}
            aria-label={isExpanded ? "전체화면 닫기" : "전체화면"}
            aria-pressed={isExpanded}
            title={isExpanded ? "전체화면 닫기" : "전체화면"}
          >
            {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
          </button>
        </div>
      </div>
    </dialog>
  );
};
