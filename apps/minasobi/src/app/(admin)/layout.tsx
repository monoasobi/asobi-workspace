import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { getAdminMusicList } from "@/server/queries/music";
import { readSidebarLayout } from "@/server/queries/sidebar";
import { AdminFrame } from "@/components/AdminFrame";
export default async function AdminLayout({
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
