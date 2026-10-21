// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  frame:
    "has-[[data-novel-viewer]]:bg-[var(--gray-1)] flex w-[100dvw] min-h-[100dvh] flex-col bg-background",
  body: "flex [flex:1_1_auto] min-h-0",
  content: "relative isolate flex [flex:1_1_0%] min-w-0 flex-col",
} as const;
