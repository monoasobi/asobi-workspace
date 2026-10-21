"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@asobi/ui/components/loading-overlay";
import styles from "./AppFrame.styles";

const Context = createContext<{
  pending: boolean;
  navigate: (href: string) => void;
} | null>(null);

export function ContentNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Context value={{ pending, navigate: href => startTransition(() => router.push(href)) }}>
      {children}
    </Context>
  );
}

export function useContentNavigation() {
  const value = useContext(Context);
  if (!value) throw new Error("ContentNavigation is required");
  return value;
}

export function ContentRegion({ children }: { children: ReactNode }) {
  const { pending } = useContentNavigation();
  return (
    <main className={styles.content} aria-busy={pending}>
      <div inert={pending} className="relative z-0 flex min-h-0 w-full flex-1 flex-col">
        {children}
      </div>
      {pending && <LoadingOverlay />}
    </main>
  );
}
