"use client";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "@asobi/loudasobi-view/i18n/messages";
import type { GuideDocument } from "@/server/queries/guide";
import { EditorPage } from "./EditorPage";
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
      <EditorPage
        musicId={initial.music.id}
        title={`${initial.music.korTitle} · 콜 편집`}
      >
        <CallGuideEditor initial={initial} readOnly={readOnly} embedded />
      </EditorPage>
    </NextIntlClientProvider>
  );
}
