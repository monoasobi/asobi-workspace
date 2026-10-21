import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { getBooksData } from "@/server/queries/content";
import { contentSelection } from "@/components/content/routeSelection";
import { ContentWorkspace } from "@/components/content/ContentWorkspace";
export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const data = await getBooksData();
  const node = contentSelection(
    await searchParams,
    data,
    session.role === "admin",
  );
  return (
    <ContentWorkspace
      data={data}
      node={node}
      readOnly={session.role !== "admin"}
    />
  );
}
