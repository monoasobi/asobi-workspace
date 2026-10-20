import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { parseMusicId } from "@/lib/musicId";
import { readGuide } from "@/server/queries/guide";
import { CallEditorPage } from "@/components/editors/CallEditorPage";

export default async function CallsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const initial = await readGuide(id);
  if (!initial) notFound();
  return (
    <CallEditorPage
      key={id}
      initial={initial}
      readOnly={session.role !== "admin"}
    />
  );
}
