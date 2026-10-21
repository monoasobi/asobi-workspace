import { Suspense } from "react";
import { AdminFrameLoading } from "@/components/loading/AdminLoading";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { getAdminMusicList } from "@/server/queries/music";
import { readSidebarLayout } from "@/server/queries/sidebar";
import { AdminFrame } from "@/components/AdminFrame";
async function AdminDataFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const [musics, layout] = await Promise.all([
    getAdminMusicList(),
    readSidebarLayout(),
  ]);
  return (
    <AdminFrame
      musics={musics}
      layout={layout}
      readOnly={session.role !== "admin"}
    >
      {children}
    </AdminFrame>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<AdminFrameLoading />}><AdminDataFrame>{children}</AdminDataFrame></Suspense>;
}
