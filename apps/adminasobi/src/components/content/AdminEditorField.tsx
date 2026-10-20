"use client";
import { Input } from "@asobi/ui/components/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@asobi/ui/components/native-select";
import type { EditorFieldConfig } from "./types";
// Original field dispatch and uncontrolled FormData contract, with shared shadcn boundaries.
export function AdminEditorField({
  id,
  field,
  visibilityFlags,
  onVisibilityChange,
}: {
  id: string;
  field: EditorFieldConfig;
  visibilityFlags: Record<string, boolean>;
  onVisibilityChange: (key: string, value: boolean) => void;
}) {
  if (field.type === "readonly")
    return (
      <>
        <input type="hidden" name={field.name} value={field.defaultValue} />
        <span>{field.displayValue ?? field.defaultValue}</span>
      </>
    );
  if (field.type === "checkbox")
    return (
      <input
        id={id}
        type="checkbox"
        name={field.name}
        checked={visibilityFlags[field.name] ?? field.defaultChecked ?? false}
        onChange={(e) => onVisibilityChange(field.name, e.target.checked)}
      />
    );
  if (field.type === "textarea")
    return (
      <textarea
        id={id}
        className="min-h-64 w-full rounded-md border bg-background p-3 font-mono text-sm"
        name={field.name}
        defaultValue={field.defaultValue ?? ""}
        required={field.required}
      />
    );
  if (field.type === "select")
    return (
      <NativeSelect
        id={id}
        name={field.name}
        defaultValue={field.defaultValue ?? ""}
      >
        {field.options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  return (
    <Input
      id={id}
      name={field.name}
      type={field.type}
      defaultValue={field.defaultValue ?? ""}
      required={field.required}
      step={field.type === "number" ? "any" : undefined}
    />
  );
}
