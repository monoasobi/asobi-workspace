import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
export const metadata: Metadata = { title: "곡 추가" };

export default async function NewMusicPage() {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  if (session.role !== "admin")
    return <p className="p-6">열람 전용 권한입니다.</p>;
  return <NewMusic data={{ musics: [], novels: [], comics: [], books: [], lyricTracks: [] }} />;
}
import { NewMusic } from "@/components/content/NewMusic";
