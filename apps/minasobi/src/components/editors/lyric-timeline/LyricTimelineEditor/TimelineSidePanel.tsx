"use client";
import type { ReactNode } from "react";
import type { LyricPlayer } from "../../playback/useLyricPlayer";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { TimelineYouTubePreview } from "../TimelineYouTubePreview";

export function TimelineSidePanel({
  player,
  disabled,
  children,
}: {
  player: LyricPlayer;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <aside className="@container flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <TimelineYouTubePreview player={player} />
      <ScrollArea className="min-h-0 flex-1 border-t">
        <fieldset disabled={disabled} className="min-w-0 p-4">
          {children}
        </fieldset>
      </ScrollArea>
    </aside>
  );
}
