"use client";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Button } from "@asobi/ui/components/button";
import type { CallGuide } from "@asobi/content-core/callGuide";
import {
  getTextSuggestions,
  parseRecentTexts,
  recentTextsKey,
  guideTextKey,
  type GuideTextKind,
  type GuideTextValue,
  type RecentGuideText,
} from "@/lib/recentGuideTexts";

const Context = createContext<{
  musicId: number;
  saved: CallGuide;
  recent: RecentGuideText[];
} | null>(null);
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === recentTextsKey || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(recentTextsKey, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(recentTextsKey, notify);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(recentTextsKey) ?? "";
  } catch {
    return "";
  }
}
const serverSnapshot = () => "";
export function RecentTextProvider({
  musicId,
  saved,
  children,
}: {
  musicId: number;
  saved: CallGuide;
  children: ReactNode;
}) {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const recent = useMemo(() => parseRecentTexts(raw), [raw]);
  return (
    <Context.Provider value={{ musicId, saved, recent }}>
      {children}
    </Context.Provider>
  );
}
export function TextSuggestions({
  kind,
  value,
  disabled,
  onSelect,
}: {
  kind: GuideTextKind;
  value: GuideTextValue;
  disabled: boolean;
  onSelect: (value: GuideTextValue) => void;
}) {
  const context = useContext(Context);
  if (!context) return null;
  const suggestions = getTextSuggestions(
    kind,
    value,
    context.musicId,
    context.saved,
    context.recent,
  );
  if (!suggestions.length) return null;
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground">추천 문구</p>
      <div className="flex min-w-0 flex-wrap gap-1">
        {suggestions.map((entry) => {
          const label = entry.value.ko || entry.value.ja || entry.value.en;
          return (
            <Button
              key={guideTextKey(kind, entry.value)}
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              className="min-w-0 max-w-full font-normal"
              title={[entry.value.ko, entry.value.ja, entry.value.en]
                .filter(Boolean)
                .join("\n")}
              aria-label={`문구 적용: ${label}`}
              onClick={() => onSelect({ ...entry.value })}
            >
              <span className="max-w-[26ch] truncate">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
