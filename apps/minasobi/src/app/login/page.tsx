import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { AdminAuthForm } from "@/components/AdminAuthForm";
export default async function LoginPage() {
  if ((await getAdminSession()).authenticated) redirect("/musics");
  return (
    <main className="flex h-dvh items-center justify-center bg-muted/30 p-5">
      <section className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <p className="mb-2 text-sm text-primary">ASOBI</p>
        <h1 className="text-xl font-semibold">관리자 로그인</h1>
        <p className="my-5 text-sm text-muted-foreground">
          MONOASOBI와 LOUDASOBI의 콘텐츠를 관리합니다.
        </p>
        <AdminAuthForm authenticated={false} />
      </section>
    </main>
  );
}
