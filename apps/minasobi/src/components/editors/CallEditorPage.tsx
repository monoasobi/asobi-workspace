"use client";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@asobi/loudasobi-view/i18n/messages";
import type { GuideDocument } from "@/server/queries/guide";
import { CallGuideEditor } from "./CallGuideEditor";

export function CallEditorPage({
  initial,
  readOnly,
}: {
  initial: GuideDocument;
  readOnly: boolean;
}) {
  return (
    <NextIntlClientProvider
      locale="ko"
      timeZone="Asia/Seoul"
      messages={messages.ko}
    >
      <CallGuideEditor initial={initial} readOnly={readOnly} embedded />
    </NextIntlClientProvider>
  );
}
