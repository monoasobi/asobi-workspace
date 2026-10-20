// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container: "min-h-0",
  header: "px-0 py-1",
  jumpButtons: "min-w-0 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden",
  scroll:
    "[&::-webkit-scrollbar]:hidden h-full overflow-y-auto [scroll-behavior:smooth]",
  icon: "inline-flex [&_svg]:w-3.5 [&_svg]:h-3.5",
  scrollWrapper:
    "relative flex-1 border border-border rounded-lg bg-background",
  line: "flex flex-col items-center gap-1 [margin:4px_0] [padding:12px_10px] [border:1px_solid_transparent] rounded-md text-center cursor-pointer [transition:background-color_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] [&[data-call-type=LOUD]]:border-primary [&[data-call-type=LOUD]_.ui-LyricsDisplayV2-reading]:text-primary [&[data-call-type=CLAP]]:[border-color:var(--yellow-600)] [&[data-call-type=CLAP]_.ui-LyricsDisplayV2-reading]:text-[var(--yellow-700)] [&[data-call-type=CUSTOM]]:[border-color:var(--cyan-600)] [&[data-call-type=CUSTOM]_.ui-LyricsDisplayV2-reading]:text-[var(--cyan-700)] [&[data-group-pos=first]]:mb-0 [&[data-group-pos=first]]:[border-bottom-color:transparent] [&[data-group-pos=first]]:[border-radius:var(--radius-md)_var(--radius-md)_0_0] [&[data-group-pos=middle]]:mt-0 [&[data-group-pos=middle]]:mb-0 [&[data-group-pos=middle]]:[border-top-color:transparent] [&[data-group-pos=middle]]:[border-bottom-color:transparent] [&[data-group-pos=middle]]:[border-radius:0] [&[data-group-pos=last]]:mt-0 [&[data-group-pos=last]]:[border-top-color:transparent] [&[data-group-pos=last]]:[border-radius:0_0_var(--radius-md)_var(--radius-md)] [&[data-active=true]]:text-primary [&[data-active=true][data-call-type]]:border-primary [&[data-active=true][data-call-type]]:shadow-md",
  japanese: "type-lyric-jp",
  reading: "ui-LyricsDisplayV2-reading type-lyric-reading",
  korean: "type-lyric-translation",
  callGuide: "mt-0.5",
} as const;
