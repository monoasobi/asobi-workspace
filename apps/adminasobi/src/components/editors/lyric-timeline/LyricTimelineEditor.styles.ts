export default {
  editor: "flex flex-col min-w-0 min-h-0 flex-1",
  workspace: "flex-1 overflow-hidden w-full min-w-0 min-h-0 h-full",
  sidePanel:
    "h-full min-w-0 min-h-0 grid [grid-template-columns:minmax(0,_1fr)] content-start overflow-y-auto items-start gap-3",
  timelineSection:
    "h-full min-w-0 min-h-0 grid border border-border rounded-lg bg-card overflow-hidden",
  preview: "grid gap-2 min-w-0",
  previewFrame:
    "relative aspect-video overflow-hidden border border-border rounded-lg bg-foreground",
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
  previewControls: "min-w-0 flex-wrap",
  volumeControl: "ml-auto min-w-[180px]",
  volumeSlider: "w-[110px]",
  volumeValue: "w-7 text-right",
  controlPanel:
    "grid content-start gap-2.5 p-3 border border-border rounded-lg bg-card",
  field: "grid [gap:5px] min-w-0 flex-1",
  popoverField: "grid [gap:5px] min-w-0 flex-1",
  exportPanel: "grid gap-2 min-w-0 pt-1 border-t border-border",
  timelineScroll: "min-w-0 min-h-0 overflow-auto outline-none",
  timelineCanvas:
    "relative flex min-h-full select-none [background-image:linear-gradient(to_bottom,_var(--border),_transparent_42px)]",
  ruler:
    "sticky left-0 z-4 [flex:0_0_80px] border-r border-border bg-muted cursor-crosshair select-none",
  tick: "absolute left-0 w-full [padding:4px_6px] border-t border-border text-muted-foreground font-mono text-[11px] whitespace-nowrap",
  track:
    "relative flex-1 min-w-0 [background-image:linear-gradient(_to_bottom,_var(--border)_1px,_transparent_1px_)] [background-size:100%_var(--timeline-grid-height)] cursor-crosshair [&[data-can-manage=false]]:cursor-default",
  playhead:
    "absolute left-0 right-0 z-5 h-0.5 bg-primary pointer-events-none [&::before]:content-[''] [&::before]:absolute [&::before]:top-1/2 [&::before]:left-[75px] [&::before]:w-2.5 [&::before]:h-2.5 [&::before]:rounded-full [&::before]:bg-primary [&::before]:-translate-y-1/2",
  block:
    "absolute left-4 right-4 z-3 grid [grid-template-rows:6px_minmax(0,_1fr)_6px] items-stretch min-h-2.5 overflow-hidden border border-primary rounded-lg bg-primary/10 text-foreground cursor-grab select-none shadow-xs [&[data-active=true]]:border-primary [&[data-active=true]]:bg-accent [&[data-active=true]]:shadow-md [&[data-selected=true]]:[outline:2px_solid_var(--primary)] [&[data-selected=true]]:[outline-offset:2px] [&[data-can-manage=false]]:[grid-template-rows:minmax(0,_1fr)] [&[data-can-manage=false]]:cursor-pointer",
  selectionRect:
    "absolute z-2 border border-primary bg-primary/15 pointer-events-none",
  blockText:
    "grid content-center gap-0.5 min-w-0 min-h-0 overflow-hidden px-2 py-0",
  blockMain:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold",
  blockReading:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-foreground text-xs font-semibold",
  blockSub:
    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-[11px]",
  handle:
    "w-full p-0 border-0 bg-primary cursor-ns-resize [&:hover]:bg-primary",
  handleStart: "[border-bottom:1px_solid_var(--primary)]",
  handleEnd: "[border-top:1px_solid_var(--primary)]",
  smallScreenNotice: "hidden",
} as const;
