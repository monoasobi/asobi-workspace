import { atomWithStorage } from "jotai/utils";

export const appearanceAtom = atomWithStorage<"light" | "dark" | "system">(
  "appearance",
  "system",
);
