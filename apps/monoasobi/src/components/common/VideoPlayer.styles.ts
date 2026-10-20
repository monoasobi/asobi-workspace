const range =
  "h-5 appearance-none rounded-full bg-transparent bg-[length:100%_4px] bg-center bg-no-repeat outline-none cursor-pointer [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/15 [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-primary [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary";
const control =
  "flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&_svg]:size-4.5";
const smallLyric =
  "font-bold italic leading-[1.2] [text-shadow:0_0_8px_rgb(0_0_0/0.9)] text-[clamp(12px,1.8cqw,14px)] group-data-[expanded=true]/video:text-[clamp(12px,1.8cqw,24px)]";
export default {
  playerDialog:
    "static block m-0 w-full max-w-none max-h-none overflow-visible border-0 bg-transparent p-0 text-inherit [&:modal]:fixed [&:modal]:inset-0 [&:modal]:h-dvh [&:modal]:overflow-hidden [&:modal]:bg-black [&::backdrop]:bg-black",
  videoSection:
    "group/video @container w-full overflow-hidden rounded-lg bg-black data-[expanded=true]:fixed data-[expanded=true]:inset-0 data-[expanded=true]:z-[1000] data-[expanded=true]:flex data-[expanded=true]:h-dvh data-[expanded=true]:flex-col data-[expanded=true]:items-center data-[expanded=true]:justify-center data-[expanded=true]:rounded-none data-[expanded=true]:[padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)] data-[expanded=true]:[--expanded-video-width:min(100%,calc((100dvh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))*16/9))]",
  videoFrame:
    "relative aspect-video w-full overflow-hidden group-data-[expanded=true]/video:shrink-0 group-data-[expanded=true]/video:w-[var(--expanded-video-width)]",
  iframeWrapper: "absolute inset-0 aspect-square -translate-y-[21.875%]",
  videoBlocker: "absolute inset-0 z-1 cursor-pointer",
  videoGradientOverlay:
    "pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[42%] [background:linear-gradient(to_bottom,transparent_0%,rgb(0_0_0/0.08)_28%,rgb(0_0_0/0.38)_70%,rgb(0_0_0/0.72)_100%)]",
  videoTopControls: "pointer-events-auto absolute top-2 right-2 z-4 flex gap-1",
  overlayToggleBtn:
    "flex items-center justify-center rounded-full border border-white/25 bg-black/50 px-2 py-1 text-[11px] font-semibold text-white/50 transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
  videoLyricsOverlay:
    "pointer-events-none absolute inset-x-0 bottom-0 z-3 flex flex-col items-center gap-[3px] px-4 pb-3 text-center group-data-[expanded=true]/video:pb-15",
  overlayJp: `${smallLyric} text-white/80`,
  overlayReading: `${smallLyric} text-white/70`,
  overlayKr:
    "text-[clamp(16px,3cqw,22px)] font-bold leading-[1.2] text-white [text-shadow:0_0_8px_rgb(0_0_0/0.9)] group-data-[expanded=true]/video:text-[clamp(16px,3cqw,36px)]",
  controls:
    "flex items-center gap-1.5 bg-black px-2.5 py-2 group-data-[expanded=true]/video:absolute group-data-[expanded=true]/video:right-[env(safe-area-inset-right)] group-data-[expanded=true]/video:bottom-[env(safe-area-inset-bottom)] group-data-[expanded=true]/video:left-[env(safe-area-inset-left)] group-data-[expanded=true]/video:z-5 group-data-[expanded=true]/video:min-h-12 group-data-[expanded=true]/video:w-auto group-data-[expanded=true]/video:bg-linear-to-b group-data-[expanded=true]/video:from-transparent group-data-[expanded=true]/video:to-black/85",
  controlBtn: control,
  timeText:
    "shrink-0 select-none text-[11px] whitespace-nowrap text-white/45 tabular-nums",
  seekInput: `${range} min-w-0 flex-1`,
  volumeWrapper: "relative flex shrink-0 items-center",
  volumeTooltip:
    "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 flex h-25 w-9 -translate-x-1/2 items-center justify-center rounded-md border border-white/10 bg-black/95 py-2.5 opacity-0 shadow-lg transition-opacity data-[show=true]:pointer-events-auto data-[show=true]:opacity-100",
  verticalVolumeInput: `${range} w-19 touch-none -rotate-90`,
} as const;
