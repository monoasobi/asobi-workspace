// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full h-[calc(100dvh_-_56px)] [&_[data-slot=scroll-area-viewport]]:p-6 [&_[data-slot=scroll-area-viewport]]:[line-height:160%]",
  pageFrame: "w-full min-h-full",
  card: "relative w-[min(420px,_100%)] overflow-hidden p-4",
} as const;
