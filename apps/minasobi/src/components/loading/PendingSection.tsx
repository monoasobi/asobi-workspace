"use client";

import type { ReactNode } from "react";
import { useNavigationGuard } from "../NavigationGuard";

export function PendingSection({
  children,
  fallback,
  loading,
}: {
  children: ReactNode;
  fallback: ReactNode;
  loading?: boolean;
}) {
  const { pending } = useNavigationGuard();
  const active = loading ?? pending;
  return (
    <div className="contents" aria-busy={active}>
      {active && (
        <div
          className="contents"
          role="status"
          aria-label="자료를 불러오는 중입니다."
        >
          {fallback}
        </div>
      )}
      <div className={active ? "hidden" : "contents"} inert={active}>
        {children}
      </div>
    </div>
  );
}
