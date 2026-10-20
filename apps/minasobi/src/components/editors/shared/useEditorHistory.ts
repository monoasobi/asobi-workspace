"use client";
import { useCallback, useState } from "react";

export type EditorHistory<T> = { past: T[]; present: T; future: T[] };
export function updateHistory<T>(
  current: EditorHistory<T>,
  next: T,
): EditorHistory<T> {
  return JSON.stringify(next) === JSON.stringify(current.present)
    ? current
    : {
        past: [...current.past.slice(-99), current.present],
        present: next,
        future: [],
      };
}
export function undoHistory<T>(current: EditorHistory<T>): EditorHistory<T> {
  return current.past.length
    ? {
        past: current.past.slice(0, -1),
        present: current.past.at(-1)!,
        future: [current.present, ...current.future],
      }
    : current;
}
export function redoHistory<T>(current: EditorHistory<T>): EditorHistory<T> {
  return current.future.length
    ? {
        past: [...current.past, current.present],
        present: current.future[0],
        future: current.future.slice(1),
      }
    : current;
}
// Extracted from Loud's bounded history; both editors keep their own document shape.
export function useEditorHistory<T>(initial: T) {
  const [state, setState] = useState<EditorHistory<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const update = useCallback(
    (change: (draft: T) => T) =>
      setState((current) => updateHistory(current, change(current.present))),
    [],
  );
  const undo = useCallback(() => setState(undoHistory), []);
  const redo = useCallback(() => setState(redoHistory), []);
  const reset = useCallback(
    (value: T) => setState({ past: [], present: value, future: [] }),
    [],
  );
  return {
    draft: state.present,
    canUndo: !!state.past.length,
    canRedo: !!state.future.length,
    update,
    undo,
    redo,
    reset,
  };
}
