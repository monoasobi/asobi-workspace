// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full h-[calc(100dvh_-_72px)] [&_[data-slot=scroll-area-viewport]]:[padding:60px_24px_24px] max-[480px]:[&_[data-slot=scroll-area-viewport]]:[padding:48px_12px_12px]",
  pageFrame: "w-full min-h-full",
  card: "max-w-[720px] p-6 [margin:0_auto] overflow-visible",
  content: "[&_img]:w-[clamp(160px,_50%,_320px)] [&_img]:aspect-square",
} as const;
