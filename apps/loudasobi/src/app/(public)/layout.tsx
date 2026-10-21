import { PublicMusicPage } from "@/components/layout/PublicMusicPage";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicMusicPage>{children}</PublicMusicPage>;
}
