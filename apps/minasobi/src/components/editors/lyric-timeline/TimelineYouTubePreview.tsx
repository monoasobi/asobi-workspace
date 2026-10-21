"use client";
import type { LyricPlayer } from "@/components/editors/playback/useLyricPlayer";
import { LyricOverlay } from "@/components/editors/playback/LyricOverlay";
import ReactPlayer from "react-player";
import styles from "./LyricTimelineEditor.styles";
export const TimelineYouTubePreview = ({ player }: { player: LyricPlayer }) => {
  const { activeLine, showJp, showReading, togglePlay } = player;
  return (
    <div className="flex shrink-0 justify-center overflow-hidden bg-black [height:min(56.25cqw,50%)]">
      <div className="relative aspect-video h-full max-w-full overflow-hidden">
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
    </div>
  );
};
