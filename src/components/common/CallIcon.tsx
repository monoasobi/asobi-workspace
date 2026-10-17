import { Hand, Megaphone, MicVocal } from "lucide-react";
import type { CallSection } from "@/types/lyric";

export function CallIcon({ type, emoji }: Pick<CallSection, "type" | "emoji">) {
  if (type === "custom")
    return emoji ? (
      <span aria-hidden="true" className="shrink-0 text-[1em] leading-none">
        {emoji}
      </span>
    ) : null;
  const Icon = { clap: Hand, chant: Megaphone, singalong: MicVocal }[type];
  return (
    <Icon
      aria-hidden="true"
      className="inline-block size-3.5 shrink-0 align-middle"
    />
  );
}
