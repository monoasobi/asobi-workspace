"use client";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@asobi/ui/components/tooltip";
import { Provider } from "jotai";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider><TooltipProvider>{children}</TooltipProvider></Provider>
    </ThemeProvider>
  );
}
