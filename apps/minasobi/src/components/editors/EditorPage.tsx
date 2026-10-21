"use client";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { Button } from "@asobi/ui/components/button";
import { useNavigationGuard } from "@/components/NavigationGuard";

export function EditorPage({
  musicId,
  title,
  children,
}: {
  musicId: number;
  title: string;
  children: React.ReactNode;
}) {
  const router = useLoadingRouter(),
    guard = useNavigationGuard();
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b bg-card px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          disabled={guard.busy}
          onClick={() => {
            if (guard.confirmLeave()) router.push(`/musics/${musicId}`);
          }}
        >
          곡 상세로
        </Button>
        <h2 className="truncate text-sm font-semibold">{title}</h2>
      </header>
      {children}
    </section>
  );
}
