// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full max-w-[1024px] h-[calc(100dvh_-_72px)] [&_[data-slot=scroll-area-viewport]]:px-6 pt-16 pb-6 max-[480px]:[&_[data-slot=scroll-area-viewport]]:px-4 pt-16 pb-6",
  card: "p-6 overflow-visible",
  pageFrame: "w-full min-h-full",
  smallImage: "w-full max-w-[360px]",
  largeImage: "w-full max-w-[600px]",
  desc: "w-[90%]",
} as const;
