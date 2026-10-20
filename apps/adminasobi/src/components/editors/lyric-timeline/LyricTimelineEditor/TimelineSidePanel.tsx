"use client";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";

import { Undo2, Redo2, Copy, Repeat, RotateCcw } from "lucide-react";

import type { LyricPlayer } from "@/components/editors/playback/useLyricPlayer";

import styles from "../LyricTimelineEditor.module.css";
import { TimelineYouTubePreview } from "../TimelineYouTubePreview";
import { AdminSrtExport, type AdminSrtExportProps } from "../../AdminSrtExport";

interface TimelineSidePanelProps {
  historyControls: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    copy: () => void;
    loop: boolean;
    toggleLoop: () => void;
    hasSelection: boolean;
  };
  player: LyricPlayer;
  dirty: boolean;
  canManage: boolean;
  isSaving: boolean;
  message: { tone: "success" | "error"; text: string } | null;
  onSave: () => void;
  onReset: () => void;
  srtExport: AdminSrtExportProps;
}

export const TimelineSidePanel = ({
  historyControls,
  player,
  dirty,
  canManage,
  isSaving,
  message,
  onSave,
  onReset,
  srtExport,
}: TimelineSidePanelProps) => (
  <aside className={styles.sidePanel}>
    <TimelineYouTubePreview player={player} />
    <div className="flex flex-wrap gap-2 p-2">
      <Button
        size="sm"
        variant="outline"
        disabled={!canManage || !historyControls.canUndo}
        onClick={historyControls.undo}
        title="⌘/Ctrl+Z"
      >
        <Undo2 className="size-4" />
        실행 취소
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!canManage || !historyControls.canRedo}
        onClick={historyControls.redo}
        title="⌘/Ctrl+Shift+Z"
      >
        <Redo2 className="size-4" />
        다시 실행
      </Button>
      <Button size="sm" variant="outline" onClick={historyControls.copy}>
        <Copy className="size-4" />
        초안 복사
      </Button>
      <Button
        size="sm"
        variant={historyControls.loop ? "default" : "outline"}
        disabled={!historyControls.hasSelection}
        onClick={historyControls.toggleLoop}
        aria-pressed={historyControls.loop}
      >
        <Repeat className="size-4" />
        선택 줄 반복
      </Button>
    </div>

    <div className={styles.controlPanel}>
      <span className="text-muted-foreground text-xs">
        가사 이동·길이 조절 시 재생 위치에 스냅됩니다. Cmd/Ctrl을 누르면 스냅이
        해제됩니다.
      </span>
      <label className={styles.field}>
        <span className="font-semibold text-muted-foreground text-xs">
          sync
        </span>
        <Input
          type="number"
          step="0.01"
          value={player.offset}
          disabled={!canManage}
          onChange={(event) => {
            if (!canManage) return;

            const value = Number(event.target.value);
            if (Number.isFinite(value)) player.setOffset(value);
          }}
        />
      </label>
      <div className="flex flex-wrap gap-1">
        {[-0.1, -0.01, 0.01, 0.1].map((step) => (
          <Button
            key={step}
            type="button"
            size="sm"
            variant="secondary"

            disabled={!canManage}
            onClick={() => player.adjustOffset(step)}
          >
            {step > 0 ? "+" : ""}
            {step}
          </Button>
        ))}
      </div>
      {canManage && (
        <div className="flex items-center flex-wrap gap-2">
          <Button
            type="button"
            size="sm"

            disabled={!dirty || isSaving}
            onClick={onSave}
          >
            {isSaving ? "저장 중" : "저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"

            onClick={onReset}
          >
            <RotateCcw width="14" height="14" />
            되돌리기
          </Button>
        </div>
      )}

      <div className={styles.exportPanel}>
        <AdminSrtExport {...srtExport} />
      </div>

      {message && (
        <div role="status" className="rounded border p-3 text-sm">
          <span>{message.text}</span>
        </div>
      )}
    </div>
  </aside>
);
