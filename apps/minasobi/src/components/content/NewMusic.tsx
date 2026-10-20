"use client";
import { useRouter } from "next/navigation";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import type { AdminDashboardData } from "./data";
export function NewMusic({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  return (
    <AdminDocumentPanel
      data={data}
      node={{ type: "newMusic" }}
      readOnly={false}
      onDeleted={() => router.push("/musics")}
    />
  );
}
