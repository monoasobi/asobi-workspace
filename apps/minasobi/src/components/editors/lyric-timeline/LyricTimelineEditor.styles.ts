export default {
  editor: "flex flex-col min-w-0 min-h-0 flex-1 overflow-hidden",
  workspace: "flex-1 overflow-hidden w-full min-w-0 min-h-0 h-full",
  timelineSection:
    "relative flex h-full min-w-0 min-h-0 flex-col overflow-hidden bg-background",
  previewIframeWrapper: "absolute inset-0 aspect-square -translate-y-[21.875%]",
  previewBlocker: "absolute inset-0 z-1 cursor-pointer",
  previewOverlay:
    "absolute right-0 top-1/2 -translate-y-1/2 left-0 z-2 grid gap-1 px-6 py-0 text-white text-center pointer-events-none [text-shadow:0_1px_6px_rgba(0,_0,_0,_0.85)]",
  previewOverlayJp:
    "m-0 min-w-0 [overflow-wrap:anywhere] [line-height:1.25] [font-size:15px]",
  previewOverlayReading:
    "m-0 min-w-0 [overflow-wrap:anywhere] [line-height:1.25] [font-size:17px] font-bold",
  previewOverlayKr:
    "m-0 min-w-0 [overflow-wrap:anywhere] [line-height:1.25] text-xl font-extrabold",
  timelineScroll: "min-w-0 min-h-0 flex-1 overflow-auto outline-none",
  timelineCanvas:
    "relative flex min-h-full select-none [background-image:linear-gradient(to_bottom,_var(--border),_transparent_42px)]",
  ruler:
    "sticky left-0 z-4 [flex:0_0_60px] border-r border-border bg-background cursor-pointer select-none",
  tick: "absolute left-0 w-full [padding:4px_6px] border-t border-border text-muted-foreground tabular-nums text-xs whitespace-nowrap pointer-events-none",
  track:
    "relative flex-1 min-w-0 [background-image:linear-gradient(_to_bottom,_var(--border)_1px,_transparent_1px_)] [background-size:100%_var(--timeline-grid-height)] cursor-crosshair [&[data-can-manage=false]]:cursor-default",
  playhead:
    "absolute left-0 right-0 z-5 h-0.5 bg-primary pointer-events-none [&::before]:content-[''] [&::before]:absolute [&::before]:top-1/2 [&::before]:left-[55px] [&::before]:w-2.5 [&::before]:h-2.5 [&::before]:rounded-full [&::before]:bg-primary [&::before]:-translate-y-1/2",
  block:
    "absolute left-4 right-4 z-3 grid [grid-template-rows:3px_minmax(0,_1fr)_3px] items-stretch min-h-2.5 overflow-hidden border border-border rounded bg-card text-foreground cursor-grab select-none shadow-xs [&[data-active=true]]:border-primary [&[data-active=true]]:bg-accent [&[data-active=true]]:shadow-md [&[data-selected=true]]:bg-primary/10 [&[data-selected=true]]:[outline:2px_solid_var(--primary)] [&[data-selected=true]]:[outline-offset:2px] [&[data-can-manage=false]]:[grid-template-rows:minmax(0,_1fr)] [&[data-can-manage=false]]:cursor-pointer",
  selectionRect:
    "absolute z-2 border border-primary bg-primary/15 pointer-events-none",
  blockText:
    "grid content-center gap-0.5 min-w-0 min-h-0 overflow-hidden px-2 py-0",
  blockMain:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold",
  blockSub:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-[11px]",
  handle:
    "relative w-full p-0 border-0 bg-primary cursor-ns-resize after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] [&:hover]:bg-primary",
  handleStart: "[border-bottom:1px_solid_var(--primary)]",
  handleEnd: "[border-top:1px_solid_var(--primary)]",
} as const;
