import { redirect } from "next/navigation";
import { getAdminMusics } from "@/server/queries/music";
export default async function MusicsPage() {
  const musics = await getAdminMusics();
  if (musics[0]) redirect(`/musics/${musics[0].id}`);
  return (
    <p className="p-8 text-sm text-muted-foreground">관리할 곡이 없습니다.</p>
  );
}
