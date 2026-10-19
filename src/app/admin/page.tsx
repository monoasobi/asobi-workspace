import { Loading } from "@/components/feedback/Loading";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/server/auth/admin";
import { getAdminDashboard } from "@/server/queries/admin";
import { cookies } from "next/headers";
import { AdminDashboard } from "./_components/AdminDashboard";
import { AdminLogin } from "./_components/AdminLogin";

import { Suspense } from "react";

interface AdminPageProps {
  searchParams: Promise<{ musicId?: string; newMusic?: string }>;
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminPageContent({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminSession = verifyAdminSession(session);

  if (!adminSession.authenticated) {
    return <AdminLogin />;
  }

  const data = await getAdminDashboard();

  const query = await searchParams;
  const creatingMusic = adminSession.role === "admin" && query.newMusic === "1";
  const requestedId = Number(query.musicId);
  const musicId = data.musics.find((music) => music.id === requestedId)?.id ?? data.musics[0]?.id;
  return <AdminDashboard key={`${musicId ?? "empty"}:${creatingMusic}`} creatingMusic={creatingMusic} musicId={musicId} data={data} role={adminSession.role} />;
}
