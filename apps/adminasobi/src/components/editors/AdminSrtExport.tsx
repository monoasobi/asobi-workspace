"use client";
import { Button } from "@asobi/ui/components/button";

import { Download } from "lucide-react";

import type { LyricLine } from "@asobi/content-core/lyrics";
import type { Music } from "@asobi/loudasobi-view/types/music";
import { roundTime } from "@asobi/content-core/lyricTime";

import {
  SRT_EXPORTS,
  buildSrt,
  downloadTextFile,
  sanitizeFilePart,
  type SrtExportConfig,
} from "./AdminSrtExport/srt";

export interface AdminSrtExportProps {
  music: Pick<Music, "id" | "title" | "korTitle">;
  lyrics: LyricLine[];
}

export const AdminSrtExport = ({ music, lyrics }: AdminSrtExportProps) => {
  const download = (config: SrtExportConfig) => {
    const normalized = lyrics.map((line) => ({
      ...line,
      start: roundTime(line.start),
      end: roundTime(line.end),
    }));
    const filename = `${music.id}_${sanitizeFilePart(music.korTitle || music.title)} ${config.suffix}.srt`;
    downloadTextFile(filename, buildSrt(normalized, config.key));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-muted-foreground text-xs">
        SRT 다운로드
      </span>
      <div className="flex flex-wrap gap-1">
        {SRT_EXPORTS.map((config) => (
          <Button
            key={config.key}
            type="button"
            size="sm"
            variant="outline"

            onClick={() => download(config)}
          >
            <Download width="14" height="14" />
            {config.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
