"use client";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import type { AdminDashboardData } from "./data";
export function NewMusic({ data }: { data: AdminDashboardData }) {
  const router = useLoadingRouter();
  return (
    <AdminDocumentPanel
      data={data}
      node={{ type: "newMusic" }}
      readOnly={false}
      onDeleted={() => router.push("/musics")}
    />
  );
}
