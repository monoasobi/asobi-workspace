import { messages as playerMessages } from "@asobi/loudasobi-view/i18n/messages";
import { overviewMessages } from "./overviewMessages";

export const messages = {
  ko: {
    ...playerMessages.ko,
    overview: overviewMessages.ko,
    dataLoading: { label: "데이터를 불러오는 중…", description: "잠시만 기다려 주세요." },
  },
  ja: {
    ...playerMessages.ja,
    overview: overviewMessages.ja,
    dataLoading: { label: "データを読み込み中…", description: "しばらくお待ちください。" },
  },
  en: {
    ...playerMessages.en,
    overview: overviewMessages.en,
    dataLoading: { label: "Loading data…", description: "Please wait a moment." },
  },
};
