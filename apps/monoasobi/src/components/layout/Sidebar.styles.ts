// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-[360px] h-[calc(100dvh_-_56px)] [flex:0_0_360px] overflow-hidden border-r border-border bg-card pointer-events-auto [transition:width_0.18s_ease,_flex-basis_0.18s_ease] [&[data-open=false]]:w-0 [&[data-open=false]]:[flex-basis:0] [&[data-open=false]]:[border-right-width:0] [&[data-open=false]]:pointer-events-none [@media(max-width:1024px)]:fixed [@media(max-width:1024px)]:top-14 [@media(max-width:1024px)]:left-0 [@media(max-width:1024px)]:z-20 [@media(max-width:1024px)]:w-[min(360px,_100dvw)] [@media(max-width:1024px)]:[flex-basis:min(360px,_100dvw)] [@media(max-width:1024px)]:[transform:translateX(0)] [@media(max-width:1024px)]:[transition:transform_0.18s_ease] [@media(max-width:1024px)]:[&[data-open=false]]:w-[min(360px,_100dvw)] [@media(max-width:1024px)]:[&[data-open=false]]:[flex-basis:min(360px,_100dvw)] [@media(max-width:1024px)]:[&[data-open=false]]:[transform:translateX(-100%)] [@media(max-width:1024px)]:[&[data-open=false]]:pointer-events-auto",
  scrollArea: "h-full overflow-y-auto overscroll-contain p-0",
  overlay:
    "hidden [@media(max-width:1024px)]:[&[data-open=true]]:fixed [@media(max-width:1024px)]:[&[data-open=true]]:[inset:56px_0_0] [@media(max-width:1024px)]:[&[data-open=true]]:z-15 [@media(max-width:1024px)]:[&[data-open=true]]:block [@media(max-width:1024px)]:[&[data-open=true]]:border-0 [@media(max-width:1024px)]:[&[data-open=true]]:bg-black/40 [@media(max-width:1024px)]:[&[data-open=true]]:cursor-default",
  item: "ui-Sidebar-item relative grid w-full min-w-0 min-h-16 [grid-template-columns:72px_minmax(0,_1fr)] items-center gap-2.5 px-4 py-2 text-foreground bg-transparent [transition:background-color_0.12s_ease] [&:hover]:bg-muted [&[data-active=true]]:bg-secondary [&[data-active=true]:hover]:bg-accent [&[data-tone=active]]:text-primary [&[data-tone=untranslated]]:text-muted-foreground [&[data-active=true]_.ui-Sidebar-itemText_>_span:not(.ui-Sidebar-textRow)]:text-primary [&[data-tone=untranslated]_.ui-Sidebar-itemText_>_span:not(.ui-Sidebar-textRow)]:text-muted-foreground [@media(max-width:359px)]:[grid-template-columns:minmax(0,_1fr)]",
  artwork:
    "w-18 aspect-square border border-border rounded-md bg-muted object-cover [@media(max-width:359px)]:hidden",
  itemText:
    "ui-Sidebar-itemText flex min-w-0 flex-col gap-0.5 overflow-hidden text-inherit [&_>_span:not(.ui-Sidebar-textRow)]:text-muted-foreground",
  textRow: "ui-Sidebar-textRow flex min-w-0 max-w-full items-center gap-1",
} as const;
