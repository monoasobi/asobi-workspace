import names from "./lucideIconNames.json";

const iconNames = new Set([...names, "hand-swing"]);
export function isCallIconName(value: string) {
  return iconNames.has(value);
}

// Read legacy emoji without changing stored documents until an administrator saves.
export function legacyCallIcon(emoji?: string): string | undefined {
  if (!emoji) return undefined;
  if (/👋|🙌|🖐|✋/.test(emoji)) return "hand-swing";
  if (/👏/.test(emoji)) return "hand";
  if (/✊|👊|🤛|🤜/.test(emoji)) return "hand-fist";
  if (/🎤|🎙|🗣/.test(emoji)) return "mic-vocal";
  if (/❤|💖|💕|💗|💙|💚|💛|💜/.test(emoji)) return "heart";
  if (/🤘/.test(emoji)) return "hand-metal";
  return "sparkles";
}
