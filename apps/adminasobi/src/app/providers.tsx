"use client";
import { ThemeProvider } from "next-themes";
import { Provider } from "jotai";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider>{children}</Provider>
    </ThemeProvider>
  );
}
