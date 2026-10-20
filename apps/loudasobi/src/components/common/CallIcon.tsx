import { Hand, HandFist, MicVocal } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { HandSwing } from "./HandSwing";
import { isCallIconName, legacyCallIcon } from "@asobi/content-core/callIcons";
import type { CallSection } from "@asobi/content-core/lyrics";

export function CallIcon({
  type,
  icon,
  emoji,
}: Pick<CallSection, "type" | "icon" | "emoji">) {
  if (type === "custom") {
    const name = icon ?? legacyCallIcon(emoji);
    if (!name || !isCallIconName(name)) return null;
    return name === "hand-swing" ? (
      <HandSwing
        aria-hidden="true"
        className="inline-block size-3.5 shrink-0 align-middle"
      />
    ) : (
      <DynamicIcon
        name={name as IconName}
        aria-hidden="true"
        className="inline-block size-3.5 shrink-0 align-middle"
      />
    );
  }
  const Icon = { clap: Hand, chant: HandFist, singalong: MicVocal }[type];
  return (
    <Icon
      aria-hidden="true"
      className="inline-block size-3.5 shrink-0 align-middle"
    />
  );
}
