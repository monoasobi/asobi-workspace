import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { readAdminSidebar } from "@/server/queries/sidebar";
import { SidebarOrderEditor } from "@/components/SidebarOrderEditor";
export const metadata: Metadata = { title: "추천 정렬" };

export default async function SidebarPage() {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  return (
    <SidebarOrderEditor
      initial={await readAdminSidebar()}
      readOnly={session.role !== "admin"}
    />
  );
}
