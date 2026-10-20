// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]]:[padding:32px_24px_48px] max-[480px]:[&_[data-slot=scroll-area-viewport]]:[padding:24px_12px_40px]",
  pageFrame: "w-full min-h-full",
  inner: "w-full max-w-[800px]",
  sectionCard: "w-full overflow-visible p-3 border-0",
  previewBox:
    "[padding:1rem_1.5rem] border border-border rounded-sm bg-card [line-height:160%] [&_>_*:first-child]:mt-0! [&_>_*:last-child]:mb-0!",
  arrow: "shrink-0 select-none",
} as const;
