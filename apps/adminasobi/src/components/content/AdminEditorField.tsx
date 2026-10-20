"use client";
import { Checkbox } from "@asobi/ui/components/checkbox";
import { Textarea } from "@asobi/ui/components/textarea";
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
        <span className="flex min-h-8 items-center rounded-lg border bg-muted/40 px-2.5 py-1 text-sm">{field.displayValue ?? field.defaultValue}</span>
      </>
    );
  if (field.type === "checkbox")
    return (
      <Checkbox
        id={id}
        name={field.name}
        checked={visibilityFlags[field.name] ?? field.defaultChecked ?? false}
        onCheckedChange={checked => onVisibilityChange(field.name, checked === true)}
      />
    );
  if (field.type === "textarea")
    return (
      <Textarea
        id={id}
        className="min-h-64 resize-y font-mono text-xs"
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
