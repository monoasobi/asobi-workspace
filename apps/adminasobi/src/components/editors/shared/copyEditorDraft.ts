export const copyEditorDraft = (value: unknown) =>
  navigator.clipboard.writeText(JSON.stringify(value, null, 2));
