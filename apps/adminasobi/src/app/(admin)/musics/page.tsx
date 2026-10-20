import { requireAdminSession } from "@/server/auth/access";
import { AdminAuthForm } from "@/components/AdminAuthForm";
export default async function MusicsPage() {
  const session = await requireAdminSession();
  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-semibold">ASOBI 곡 관리</h1>
      <p className="mb-4">
        {session.role === "admin" ? "관리자" : "열람 전용"}
      </p>
      <AdminAuthForm authenticated />
    </main>
  );
}
