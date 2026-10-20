// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full h-[calc(100dvh_-_72px)] [&_[data-slot=scroll-area-viewport]]:[padding:64px_24px_92px] [&_[data-slot=scroll-area-viewport]]:[line-height:160%] max-[480px]:[&_[data-slot=scroll-area-viewport]]:[padding:64px_12px_12px]",
  readerFrame: "w-full min-h-full",
  comicContainer:
    "w-full min-h-full max-w-[720px] p-4 [&_>_img]:w-full [&_>_img:last-child]:mb-6 max-[480px]:p-0",
} as const;
