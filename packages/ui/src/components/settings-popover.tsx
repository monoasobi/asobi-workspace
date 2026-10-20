"use client";

import { useId, useState, type ReactNode } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

// Reuse Loud's settings frame; each app keeps its own options and stored state.
export function SettingsPopover({
  title,
  description,
  closeLabel,
  children,
}: {
  title: string;
  description: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={title}>
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        aria-labelledby={`${id}-title`}
        className="max-h-[calc(100dvh-88px)] w-80 max-w-[calc(100vw-32px)] gap-0 overflow-y-auto p-0"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <h2 id={`${id}-title`} className="type-card-title">
              {title}
            </h2>
            <p className="mt-1 type-caption">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 shrink-0"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-5 p-4">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
