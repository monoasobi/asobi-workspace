"use client";
import { cn } from "@asobi/ui/lib/utils";
import { ScrollArea } from "@asobi/ui/components/scroll-area";
import { Button } from "@asobi/ui/components/button";
import { Input } from "@asobi/ui/components/input";
import { privateReaderAtom } from "@atoms/privateReader.atom";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import styles from "./PrivateReaderLogin.styles";
export const PrivateReaderLogin = () => {
  const [isNavigating, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrivateReaderAccess, setHasPrivateReaderAccess] =
    useAtom(privateReaderAtom);
  const router = useRouter();
  const isBusy = isLoading || isNavigating;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;
    setError("");
    try {
      setIsLoading(true);
      const response = await fetch("/api/private-reader/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setHasPrivateReaderAccess(true);
        startTransition(() => {
          router.push("/");
          router.refresh();
        });
        return;
      }
      setHasPrivateReaderAccess(false);
      setError("비밀번호가 틀렸습니다.");
    } catch (error) {
      console.error(error);
      setHasPrivateReaderAccess(false);
      setError("제한 콘텐츠 열람 인증 오류입니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    if (isBusy) return;
    setError("");
    try {
      setIsLoading(true);
      const response = await fetch("/api/private-reader/auth/logout", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      setHasPrivateReaderAccess(false);
      startTransition(() => router.refresh());
    } catch {
      setError("권한 비활성화에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScrollArea className={styles.container}>
      <div className={cn("flex items-center justify-center", styles.pageFrame)}>
        <section
          className={cn(
            "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs",
            styles.card,
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="type-page-title">콘텐츠 열람</h1>
              <span className="type-body text-muted-foreground">
                열람 권한을 활성화합니다.
              </span>
            </div>

            {hasPrivateReaderAccess ? (
              <div className="flex flex-col gap-3">
                <span className="type-body text-muted-foreground">
                  현재 콘텐츠 열람 권한이 활성화되어 있습니다.
                </span>
                <Button
                  aria-busy={isBusy}
                  disabled={isBusy}
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                >
                  권한 비활성화
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3">
                  <label>
                    <div className="type-caption mb-1 font-light">비밀번호</div>
                    <Input
                      disabled={isBusy}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      placeholder="비밀번호"
                      autoComplete="current-password"
                    />
                  </label>
                  <Button
                    type="submit"
                    aria-busy={isBusy}
                    disabled={isBusy || !password}
                  >
                    확인
                  </Button>
                </div>
              </form>
            )}
          </div>
          {error && (
            <p role="alert" className="type-body text-primary mt-3">
              {error}
            </p>
          )}
        </section>
      </div>
    </ScrollArea>
  );
};
