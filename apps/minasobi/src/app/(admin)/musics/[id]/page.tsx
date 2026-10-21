import type { Metadata } from "next";
import { MusicDetail } from "@/components/MusicDetail";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/access";
import { getMusicContent } from "@/server/queries/musicContent";
import { contentSelection } from "@/components/content/routeSelection";
import { parseMusicId } from "@/lib/musicId";
export const metadata: Metadata = { title: "곡 정보" };

export default async function MusicPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const [content, query] = await Promise.all([
    getMusicContent(id), searchParams,
  ]);
  if (!content) notFound();
  const { music, data, revision } = content;
  const node = contentSelection(query, data, session.role === "admin", id);
  return (
    <MusicDetail
      key={music.id}
      initialMusic={music}
      readOnly={session.role !== "admin"}
      contentData={data}
      contentNode={node}
      contentRevision={revision}
      contentActive={query.tab === "content" || node !== null}
    />
  );
}
