"use client";
import { useLoadingRouter } from "@/components/NavigationGuard";
import { FormSkeleton } from "../loading/AdminSkeletons";
import { PendingSection } from "../loading/PendingSection";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import type { AdminDashboardData } from "./data";
export function NewMusic({ data }: { data: AdminDashboardData }) {
  const router = useLoadingRouter();
  return (
    <PendingSection fallback={<FormSkeleton />}>
    <AdminDocumentPanel
      data={data}
      node={{ type: "newMusic" }}
      readOnly={false}
      onDeleted={() => router.push("/musics")}
    />
    </PendingSection>
  );
}
