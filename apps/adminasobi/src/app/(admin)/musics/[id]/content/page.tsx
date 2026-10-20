import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "@/server/auth/access";
import { parseMusicId } from "@/lib/musicId";

// Preserve old links while keeping content management inside the song detail.
export default async function ContentPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const query = new URLSearchParams({ tab: "content" });
  for (const [key, value] of Object.entries(await searchParams)) {
    if ((key === "type" || key === "id") && typeof value === "string") query.set(key, value);
  }
  redirect(`/musics/${id}?${query}`);
}
