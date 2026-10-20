// Adapted from alan-crts/shadcn-iconpicker (MIT). See docs/licenses/shadcn-iconpicker.txt.
"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asobi/ui/components/popover";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { cn } from "@asobi/ui/lib/utils";
import { LucideProps, LucideIcon } from "lucide-react";
import {
  DynamicIcon,
  dynamicIconImports,
  type IconName as LucideIconName,
} from "lucide-react/dynamic";
import { HandSwing } from "@/components/common/HandSwing";
type IconName = LucideIconName | "hand-swing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@asobi/ui/components/tooltip";
import { iconsData } from "./icons-data";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import Fuse from "fuse.js";
import { useDebounceValue } from "usehooks-ts";

export type IconData = (typeof iconsData)[number];

interface IconPickerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>,
  "onSelect" | "onOpenChange"
> {
  value?: IconName | "";
  defaultValue?: IconName;
  onValueChange?: (value: IconName) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  triggerPlaceholder?: string;
  iconsList?: IconData[];
  presets?: readonly { name: IconName; label: string }[];
  categorized?: boolean;
  modal?: boolean;
}

const IconRenderer = React.memo(({ name }: { name: IconName }) => {
  return <Icon name={name} />;
});
IconRenderer.displayName = "IconRenderer";

const IconPicker = React.forwardRef<
  React.ComponentRef<typeof PopoverTrigger>,
  IconPickerProps
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      children,
      searchable = true,
      searchPlaceholder = "아이콘 검색 (영문 이름)",
      triggerPlaceholder = "아이콘 선택",
      iconsList,
      presets,
      categorized = true,
      modal = false,
      ...props
    },
    ref,
  ) => {
    const [selectedIcon, setSelectedIcon] = useState<IconName | undefined>(
      defaultValue,
    );
    const [isOpen, setIsOpen] = useState(defaultOpen || false);
    const [search, setSearch] = useDebounceValue("", 100);
    const icons = useMemo(
      () =>
        iconsData.filter(
          (icon) =>
            icon.name === "hand-swing" || icon.name in dynamicIconImports,
        ),
      [],
    );

    const iconsToUse = useMemo(() => iconsList || icons, [iconsList, icons]);

    const fuseInstance = useMemo(() => {
      return new Fuse(iconsToUse, {
        keys: ["name", "tags", "categories"],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true,
      });
    }, [iconsToUse]);

    const filteredIcons = useMemo(() => {
      if (search.trim() === "") {
        return iconsToUse;
      }

      const results = fuseInstance.search(search.toLowerCase().trim());
      return results.map((result) => result.item);
    }, [search, iconsToUse, fuseInstance]);

    const categorizedIcons = useMemo(() => {
      if (!categorized || search.trim() !== "") {
        return [{ name: "전체 아이콘", icons: filteredIcons }];
      }

      const categories = new Map<string, IconData[]>();

      filteredIcons.forEach((icon) => {
        if (icon.categories && icon.categories.length > 0) {
          icon.categories.forEach((category) => {
            if (!categories.has(category)) {
              categories.set(category, []);
            }
            categories.get(category)!.push(icon);
          });
        } else {
          const category = "기타";
          if (!categories.has(category)) {
            categories.set(category, []);
          }
          categories.get(category)!.push(icon);
        }
      });

      return Array.from(categories.entries())
        .map(([name, icons]) => ({ name, icons }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredIcons, categorized, search]);

    const virtualItems = useMemo(() => {
      const items: Array<{
        type: "category" | "row";
        categoryIndex: number;
        rowIndex?: number;
        icons?: IconData[];
      }> = [];

      categorizedIcons.forEach((category, categoryIndex) => {
        items.push({ type: "category", categoryIndex });

        const rows = [];
        for (let i = 0; i < category.icons.length; i += 5) {
          rows.push(category.icons.slice(i, i + 5));
        }

        rows.forEach((rowIcons, rowIndex) => {
          items.push({
            type: "row",
            categoryIndex,
            rowIndex,
            icons: rowIcons,
          });
        });
      });

      return items;
    }, [categorizedIcons]);

    const categoryIndices = useMemo(() => {
      const indices: Record<string, number> = {};

      virtualItems.forEach((item, index) => {
        if (item.type === "category") {
          indices[categorizedIcons[item.categoryIndex].name] = index;
        }
      });

      return indices;
    }, [virtualItems, categorizedIcons]);

    const parentRef = React.useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
      enabled: open ?? isOpen,
      count: virtualItems.length,
      getScrollElement: () => parentRef.current,
      estimateSize: (index) =>
        virtualItems[index].type === "category" ? 25 : 40,
      paddingEnd: 2,
      gap: 10,
      overscan: 5,
    });

    const handleValueChange = useCallback(
      (icon: IconName) => {
        if (value === undefined) {
          setSelectedIcon(icon);
        }
        onValueChange?.(icon);
      },
      [value, onValueChange],
    );

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        setSearch("");
        if (open === undefined) {
          setIsOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [open, onOpenChange, setSearch],
    );

    const handleIconClick = useCallback(
      (iconName: IconName) => {
        handleValueChange(iconName);
        handleOpenChange(false);
      },
      [handleValueChange, handleOpenChange],
    );

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        if (parentRef.current) {
          parentRef.current.scrollTop = 0;
        }

        virtualizer.scrollToOffset(0);
      },
      [virtualizer, setSearch],
    );

    const scrollToCategory = useCallback(
      (categoryName: string) => {
        const categoryIndex = categoryIndices[categoryName];

        if (categoryIndex !== undefined && virtualizer) {
          virtualizer.scrollToIndex(categoryIndex, {
            align: "start",
            behavior: "smooth",
          });
        }
      },
      [categoryIndices, virtualizer],
    );

    const categoryButtons = useMemo(() => {
      if (!categorized || search.trim() !== "") return null;

      return categorizedIcons.map((category) => (
        <Button
          key={category.name}
          variant={"outline"}
          size="sm"
          className="text-xs"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToCategory(category.name);
          }}
        >
          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
        </Button>
      ));
    }, [categorizedIcons, scrollToCategory, categorized, search]);

    const renderIcon = useCallback(
      (icon: IconData) => (
        <TooltipProvider key={icon.name}>
          <Tooltip>
            <TooltipTrigger
              type="button"
              aria-label={icon.name}
              aria-pressed={(value ?? selectedIcon) === icon.name}
              className={cn(
                "p-2 rounded-md border hover:bg-foreground/10 transition",
                "flex items-center justify-center",
              )}
              onClick={() => handleIconClick(icon.name as IconName)}
            >
              <IconRenderer name={icon.name as IconName} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{icon.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      [handleIconClick, value, selectedIcon],
    );

    const renderVirtualContent = useCallback(() => {
      if (filteredIcons.length === 0) {
        return (
          <div className="text-center text-gray-500">검색 결과가 없습니다.</div>
        );
      }

      return (
        <div
          className="relative w-full overscroll-contain"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
            const item = virtualItems[virtualItem.index];

            if (!item) return null;

            const itemStyle = {
              position: "absolute" as const,
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            };

            if (item.type === "category") {
              return (
                <div
                  key={virtualItem.key}
                  style={itemStyle}
                  className="top-0 bg-background z-10"
                >
                  <h3 className="font-medium text-sm capitalize">
                    {categorizedIcons[item.categoryIndex].name}
                  </h3>
                  <div className="h-[1px] bg-foreground/10 w-full" />
                </div>
              );
            }

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                style={itemStyle}
              >
                <div className="grid grid-cols-5 gap-2 w-full">
                  {item.icons!.map(renderIcon)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }, [
      virtualizer,
      virtualItems,
      categorizedIcons,
      filteredIcons,
      renderIcon,
    ]);

    return (
      <Popover
        open={open ?? isOpen}
        onOpenChange={handleOpenChange}
        modal={modal}
      >
        <PopoverTrigger data-icon-picker ref={ref} asChild {...props}>
          {children || (
            <Button type="button" variant="outline">
              {value || selectedIcon ? (
                <>
                  <Icon name={(value || selectedIcon)!} />{" "}
                  {value || selectedIcon}
                </>
              ) : (
                triggerPlaceholder
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent data-icon-picker className="w-64 p-2">
          {!!presets?.length && (
            <div className="mb-3 space-y-1">
              <p className="text-xs text-muted-foreground">자주 쓰는 아이콘</p>
              <div
                className="grid grid-cols-7 gap-1"
                role="group"
                aria-label="자주 쓰는 아이콘"
              >
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    size="icon-sm"
                    className="h-8 w-full min-w-0 p-0"
                    variant={
                      (value ?? selectedIcon) === preset.name
                        ? "secondary"
                        : "ghost"
                    }
                    title={preset.label}
                    aria-label={preset.label}
                    aria-pressed={(value ?? selectedIcon) === preset.name}
                    onClick={() => handleIconClick(preset.name)}
                  >
                    <Icon name={preset.name} className="size-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              onChange={handleSearchChange}
              className="mb-2"
            />
          )}
          {categorized && search.trim() === "" && (
            <div className="flex flex-row gap-1 mt-2 overflow-x-auto pb-2">
              {categoryButtons}
            </div>
          )}
          <div
            ref={parentRef}
            className="h-60 overflow-auto"
            style={{ scrollbarWidth: "thin" }}
          >
            {renderVirtualContent()}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
IconPicker.displayName = "IconPicker";

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

const Icon = React.forwardRef<React.ComponentRef<LucideIcon>, IconProps>(
  ({ name, ...props }, ref) => {
    return name === "hand-swing" ? (
      <HandSwing {...props} ref={ref} />
    ) : (
      <DynamicIcon name={name} {...props} ref={ref} />
    );
  },
);
Icon.displayName = "Icon";

export { IconPicker, Icon, type IconName };
