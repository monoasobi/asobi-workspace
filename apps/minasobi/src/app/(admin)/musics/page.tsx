import { redirect } from "next/navigation";
import { getFirstAdminMusicId } from "@/server/queries/music";
export default async function MusicsPage() {
  const id = await getFirstAdminMusicId();
  if (id !== null) redirect(`/musics/${id}`);
  return (
    <p className="p-8 text-sm text-muted-foreground">관리할 곡이 없습니다.</p>
  );
}
