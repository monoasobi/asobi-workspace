import { messages as playerMessages } from "@asobi/loudasobi-view/i18n/messages";
import { overviewMessages } from "./overviewMessages";

export const messages = {
  ko: {
    ...playerMessages.ko,
    overview: overviewMessages.ko,
    dataLoading: "불러오는 중입니다.",
  },
  ja: {
    ...playerMessages.ja,
    overview: overviewMessages.ja,
    dataLoading: "読み込み中です。",
  },
  en: {
    ...playerMessages.en,
    overview: overviewMessages.en,
    dataLoading: "Loading…",
  },
};
