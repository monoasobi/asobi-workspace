// Static Tailwind variants; layout/interaction ownership stays with this component.
export default {
  shell:
    "flex min-h-full w-full items-center justify-center p-8 [background:#f8f7f4] [color:#1f1d1b] max-[520px]:items-stretch max-[520px]:p-4",
  panel:
    "w-[min(720px,_100%)] [border:1px_solid_#ded8ce] [border-radius:8px] [background:#fffdf8] p-8 [&_h1]:m-0 [&_h1]:text-3xl [&_h1]:[line-height:1.25] [&_h1]:[letter-spacing:0] max-[520px]:[padding:24px_18px] max-[520px]:[&_h1]:[font-size:26px]",
  eyebrow: "mb-3 [color:#b42318] text-[13px] font-bold",
  description: "mt-3 [color:#625f5a] text-base [line-height:1.7]",
  meta: "grid gap-2.5 mt-6 [&_div]:grid [&_div]:[grid-template-columns:96px_minmax(0,_1fr)] [&_div]:gap-3 [&_div]:[border-top:1px_solid_#ece6dc] [&_div]:pt-2.5 [&_dt]:[color:#7a746b] [&_dt]:text-[13px] [&_dt]:font-bold [&_dd]:m-0 [&_dd]:min-w-0 [&_dd]:[overflow-wrap:anywhere] max-[520px]:[&_div]:[grid-template-columns:1fr] max-[520px]:[&_div]:gap-1",
  links:
    "flex flex-wrap gap-2 mt-7 [&_a]:[border:1px_solid_#ded8ce] [&_a]:rounded-lg [&_a]:[padding:8px_10px] [&_a]:[background:#ffffff] [&_a]:[color:#1f1d1b] [&_a]:text-sm",
} as const;
