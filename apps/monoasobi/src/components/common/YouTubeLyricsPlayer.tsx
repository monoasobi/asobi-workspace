"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@asobi/ui/components/popover";
import { Button } from "@asobi/ui/components/button";
import type { LyricTrack } from "@asobi/content-core/lyrics";
import type { Music } from "@appTypes/music";
import { LyricsDisplayV2 } from "@components/common/LyricsDisplayV2";
import { VideoPlayer } from "./VideoPlayer";
import styles from "./YouTubeLyricsPlayer.styles";
import { useLyricPlayer } from "./YouTubeLyricsPlayer/useLyricPlayer";
const OFFSET_STEPS = [0.01, 0.05, 0.1, 0.5];
export interface YouTubeLyricsPlayerProps {
  music: Music;
  lyricTrack: LyricTrack | null;
}
export const YouTubeLyricsPlayer = ({
  music,
  lyricTrack,
}: YouTubeLyricsPlayerProps) => {
  const track = lyricTrack;
  const player = useLyricPlayer({
    youtubeId: music.youtubeId ?? "",
    lyrics: track?.lyric,
    sync: track?.sync ?? 0,
  });
  const {
    offset: lyricsOffset,
    activeLineIndex,
    adjustOffset: handleOffsetChange,
    resetOffset,
  } = player;
  const syncLabel =
    lyricsOffset !== 0
      ? `sync ${lyricsOffset >= 0 ? "+" : ""}${lyricsOffset.toFixed(2)}`
      : "sync";
  return (
    <ScrollArea className={styles.container}>
      <div className="flex flex-col gap-3">
        <div className={cn("flex flex-col gap-3", styles.innerContainer)}>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-3 flex-wrap">
              <div className="flex flex-row items-end gap-1 flex-wrap">
                <h3 className="type-card-title">{music.title}</h3>
                <span className="type-body text-muted-foreground">
                  {music.korTitle}
                </span>
              </div>

              {process.env.NODE_ENV === "development" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-muted-foreground"
                    >
                      {syncLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[260px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="type-body font-bold">SYNC</span>
                        <span
                          className={cn(
                            "type-body text-muted-foreground",
                            styles.syncValue,
                          )}
                        >
                          {lyricsOffset >= 0 ? "+" : ""}
                          {lyricsOffset.toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {OFFSET_STEPS.map((step) => (
                          <Button
                            key={`minus-${step}`}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOffsetChange(-step)}
                            className="text-muted-foreground"
                          >
                            -{step}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {OFFSET_STEPS.map((step) => (
                          <Button
                            key={`plus-${step}`}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOffsetChange(step)}
                            className="text-muted-foreground"
                          >
                            +{step}
                          </Button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={resetOffset}
                        className="text-primary"
                      >
                        reset
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {music.youtubeId ? (
              <VideoPlayer player={player} />
            ) : (
              <section
                className={cn(
                  "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
                  styles.statusCard,
                )}
              >
                <span className="type-body text-muted-foreground">
                  등록된 YouTube 영상이 없습니다.
                </span>
              </section>
            )}
          </div>
        </div>

        {track && (
          <LyricsDisplayV2
            lyrics={track.lyric}
            activeIndex={activeLineIndex}
            offset={lyricsOffset}
            onSeek={player.seekAndPlay}
          />
        )}

        {!track && (
          <section
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
              styles.statusCard,
            )}
          >
            <span className="type-body text-muted-foreground">
              이 곡의 가사 파일은 아직 준비되지 않았습니다.
            </span>
          </section>
        )}
      </div>
    </ScrollArea>
  );
};
