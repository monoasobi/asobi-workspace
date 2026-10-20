"use client";
import { useState } from "react";
import {
  Combobox, ComboboxValue, ComboboxChip, ComboboxChips, ComboboxChipsInput,
  ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, useComboboxAnchor,
} from "@asobi/ui/components/combobox";
import type { MultiSelectFieldConfig } from "./types";

export function AdminMultiSelectField({ id, field, disabled, onEdit }: {
  id: string;
  field: MultiSelectFieldConfig;
  disabled: boolean;
  onEdit: () => void;
}) {
  const [value, setValue] = useState(field.defaultValue);
  const anchor = useComboboxAnchor();
  const options = new Map(field.options.map(option => [option.value, option]));
  return (
    <>
      <input type="hidden" name={field.name} value={value.join(",")} disabled={disabled} />
      <Combobox items={field.options.map(option => option.value)} multiple value={value} disabled={disabled}
        itemToStringLabel={item => {
          const option = options.get(item);
          return option ? `${option.label} ${option.description ?? ""}` : item;
        }}
        onValueChange={next => { setValue(next); onEdit(); }}>
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>{value.map(item => <ComboboxChip key={item} className="max-w-full" title={options.get(item)?.label}><span className="truncate">{options.get(item)?.label ?? `소설 #${item}`}</span></ComboboxChip>)}</ComboboxValue>
          <ComboboxChipsInput id={id} placeholder="소설 제목이나 곡명으로 검색" />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
          <ComboboxList>{(item: string) => {
            const option = options.get(item);
            return <ComboboxItem key={item} value={item}>
              <span className="grid min-w-0 gap-0.5">
                <span className="break-words">{option?.label ?? item}</span>
                {option?.description && <span className="type-caption">{option.description}</span>}
              </span>
            </ComboboxItem>;
          }}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}
