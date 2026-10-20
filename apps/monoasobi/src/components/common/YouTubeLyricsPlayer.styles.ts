// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full h-[calc(100dvh_-_72px)] [&_[data-slot=scroll-area-viewport]]:px-6 pt-16 pb-6 max-[480px]:[&_[data-slot=scroll-area-viewport]]:px-4 pt-16 pb-6",
  innerContainer: "w-full",
  statusCard: "bg-card",
  syncValue: "tabular-nums",
} as const;
