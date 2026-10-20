import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getAdminSession()).authenticated) redirect("/login");
  return children;
}
