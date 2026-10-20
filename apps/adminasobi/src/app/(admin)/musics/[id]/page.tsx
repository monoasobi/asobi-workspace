import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/access";
import { getAdminMusics } from "@/server/queries/music";
import { parseMusicId } from "@/lib/musicId";
export default async function MusicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const [music] = await getAdminMusics(id);
  if (!music) notFound();
  return (
    <div className="grid min-h-0 flex-1 gap-5 overflow-auto p-5 xl:grid-cols-2">
      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">곡 정보</h2>
        <p className="mt-3" lang="ja">
          {music.title}
        </p>
        <p className="text-sm text-muted-foreground">{music.korTitle}</p>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">콜 정보</h2>
        <p className="mt-3 text-sm">
          {music.publish ? "공개" : "비공개"} ·{" "}
          {music.hasLyrics ? "가사 연결됨" : "가사 준비 중"}
        </p>
      </section>
    </div>
  );
}
