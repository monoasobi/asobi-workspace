import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { getDeletedMusics } from "@/server/queries/content";
import { MusicLifecycle } from "@/components/content/MusicLifecycle";
export default async function DeletedMusicPage() {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const musics = await getDeletedMusics();
  return (
    <section className="space-y-4 overflow-y-auto p-6">
      <h2 className="font-semibold">숨긴 곡</h2>
      <p className="text-sm text-muted-foreground">
        연결 자료와 콜 공개 설정은 보존됩니다. 복원하면 이전 공개 설정이 다시
        적용될 수 있습니다.
      </p>
      {musics.map((m) => (
        <article
          key={m.id}
          className="flex items-center justify-between gap-3 rounded border p-3"
        >
          <span>
            {m.id}: {m.title}
          </span>
          {session.role === "admin" && <MusicLifecycle id={m.id} restore />}
        </article>
      ))}
      {!musics.length && <p>숨긴 곡이 없습니다.</p>}
    </section>
  );
}
