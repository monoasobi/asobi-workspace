"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { volumeAtom } from "@asobi/loudasobi-view/atoms/player";

export const usePlayerVolume = () => {
  const [volume, setVolume] = useAtom(volumeAtom);
  const [isMuted, setIsMuted] = useState(false);
  const changeVolume = (value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.min(1, Math.max(0, value));
    setVolume(next);
    if (next > 0) setIsMuted(false);
  };
  return {
    volume,
    isMuted,
    changeVolume,
    effectiveVolume: isMuted ? 0 : volume,
    toggleMute: () => setIsMuted((value) => !value),
  };
};
