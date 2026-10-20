// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  container:
    "w-full h-[calc(100dvh_-_56px)] bg-background [&_[data-slot=scroll-area-viewport]]:[line-height:160%]",
  page: "w-full",
  hero: "relative flex min-h-[min(680px,_calc(100dvh_-_96px))] items-end [background-image:linear-gradient(_0deg,_rgba(0,_0,_0,_0.76)_0%,_rgba(0,_0,_0,_0.48)_44%,_rgba(0,_0,_0,_0.16)_100%_),_url('/images/assets/yoasobi.jpg')] bg-center bg-cover text-white max-[1024px]:min-h-[480px] max-[480px]:min-h-[360px]",
  heroInner:
    "w-full max-w-[1120px] [padding:72px_32px_56px] [margin:0_auto] max-[480px]:[padding:56px_20px_40px]",
  heroCopy: "[color:rgba(255,_255,_255,_0.88)]",
  section: "w-full [padding:64px_32px] max-[480px]:[padding:48px_20px]",
  sectionInner: "w-full max-w-[1120px] [margin:0_auto]",
  eyebrow: "text-primary font-bold",
  logo: "relative [aspect-ratio:480/125] max-w-[480px] w-full [align-self:center] [margin:32px_0]",
  featureGrid:
    "grid w-full [grid-template-columns:repeat(3,_minmax(0,_1fr))] gap-4 max-[960px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr]",
  featureCard: "p-5 overflow-visible",
  routeCard: "p-5 overflow-visible",
  iconShell: "shrink-0 w-10 h-10 rounded-full bg-secondary text-primary",
  routeIconContain: "flex justify-center p-1",
  routeStep:
    "ui-Overview-routeStep [padding:14px_0] [&_+_.ui-Overview-routeStep]:border-t border-border",
  noticeBand: "border-y border-border bg-card",
} as const;
