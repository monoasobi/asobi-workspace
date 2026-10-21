export const textTargetSelector =
  'textarea, select, [role="textbox"], [role="combobox"], [role="listbox"], [role="radiogroup"], [role="checkbox"], [role="menu"], [data-text-selection], [data-icon-picker]';
export function isEditorTextTarget(target: EventTarget | null, space = false) {
  if (!(target instanceof Element)) return false;
  if (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target.closest(textTargetSelector)
  )
    return true;
  const input = target.closest("input");
  return (
    !!input &&
    (!space ||
      ![
        "range",
        "checkbox",
        "radio",
        "button",
        "submit",
        "reset",
        "file",
        "color",
      ].includes(input.type))
  );
}
export function editorCommand(
  event: Pick<
    KeyboardEvent,
    | "key"
    | "code"
    | "metaKey"
    | "ctrlKey"
    | "altKey"
    | "shiftKey"
    | "isComposing"
  >,
  text: boolean,
) {
  if (event.isComposing || event.altKey) return null;
  const key = event.key.toLowerCase();
  if (event.metaKey || event.ctrlKey) {
    if (key === "s") return "save";
    if (text) return null;
    if (key === "z") return event.shiftKey ? "redo" : "undo";
    if (key === "y") return "redo";
    if (key === "=" || key === "+") return "zoomIn";
    if (key === "-") return "zoomOut";
    return null;
  }
  if (text) return null;
  if (event.code === "Space") return "toggle";
  if (["ArrowLeft", "ArrowUp"].includes(event.key)) return "backward";
  if (["ArrowRight", "ArrowDown"].includes(event.key)) return "forward";
  if (event.code === "Enter") return "selectActive";
  return null;
}
