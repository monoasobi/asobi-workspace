"use client";

import { useId } from "react";
import { Check, Languages, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useSetLocale } from "@/i18n/LocaleProvider";
import { locales, localeNames } from "@/i18n/config";
import { SettingsPopover } from "@asobi/ui/components/settings-popover";

export function SettingsMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const { theme, setTheme } = useTheme();
  const id = useId();

  return (
    <SettingsPopover
      title={t("settings")}
      description={t("settingsHelp")}
      closeLabel={t("close")}
    >
      <fieldset>
        <legend className="mb-1 flex items-center gap-2 type-label font-semibold">
          <Languages className="size-4 text-muted-foreground" aria-hidden />
          {t("language")}
        </legend>
        <p
          id={`${id}-language-help`}
          className="mb-3 type-caption"
        >
          {t("languageHelp")}
        </p>
        <div className="space-y-1.5">
          {locales.map((value) => (
            <label key={value} className="relative block cursor-pointer">
              <input
                type="radio"
                name={`${id}-language`}
                value={value}
                checked={locale === value}
                onChange={() => setLocale(value)}
                aria-describedby={`${id}-language-help`}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                <span lang={value}>{localeNames[value]}</span>
                <Check
                  aria-hidden
                  className={`size-4 text-primary ${locale === value ? "visible" : "invisible"}`}
                />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 type-label font-semibold">
          <Sun className="size-4 text-muted-foreground" aria-hidden />
          {t("theme")}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "light", Icon: Sun },
              { value: "dark", Icon: Moon },
              { value: "system", Icon: Monitor },
            ] as const
          ).map(({ value, Icon }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name={`${id}-theme`}
                value={value}
                checked={theme === value}
                onChange={() => setTheme(value)}
                className="peer sr-only"
              />
              <span className="flex h-full min-h-20 flex-col items-center justify-center gap-2 rounded-md border px-1 py-3 text-center text-xs transition-colors hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:font-medium peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                <Icon className="size-5" aria-hidden />
                {t(value)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </SettingsPopover>
  );
}
