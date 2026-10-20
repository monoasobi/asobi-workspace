"use client";

import type { AdminRole } from "@appTypes/admin";
import { Badge, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useAtomValue } from "jotai";
import { adminNavigationAtom, confirmAdminNavigation } from "@/atoms/adminNavigation.atom";
import { Loading } from "@/components/feedback/Loading";
import { AdminDocumentPanel } from "./AdminDocumentPanel";
import { AdminContentNav } from "./AdminDashboard/AdminContentNav";
import { belongsToMusic, isValidSelectedNode, readSelection } from "./AdminDashboard/selection";
import { getSelectedNodeKey } from "./AdminDocumentPanel/utils";
import styles from "./AdminPage.module.css";

export type AdminDashboardData = Awaited<
  ReturnType<typeof import("@/server/queries/admin").getAdminDashboard>
>;

export type SelectedNode =
  | { type: "music"; id: number }
  | { type: "novel"; id: number }
  | { type: "comic"; id: number }
  | { type: "lyric"; id: number }
  | { type: "book"; id: number }
  | { type: "newMusic" }
  | { type: "newNovel"; musicId: number }
  | { type: "newComic"; musicId: number }
  | { type: "newLyric"; musicId: number }
  | { type: "newBook" };

interface AdminDashboardProps {
  data: AdminDashboardData;
  role: AdminRole;
  musicId?: number;
  creatingMusic?: boolean;
}

export const AdminDashboard = (props: AdminDashboardProps) => {
  const hydrated = useHydrated();
  return hydrated ? <AdminWorkspace {...props} /> : <Loading />;
};

const AdminWorkspace = ({ data, role, musicId, creatingMusic = false }: AdminDashboardProps) => {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const guard = useAtomValue(adminNavigationAtom);
  const canManage = role === "admin";
  const music = data.musics.find((music) => music.id === musicId);
  const storageKey = `monoasobi-admin-selection:${musicId ?? "empty"}`;
  const fallback: SelectedNode = musicId !== undefined ? { type: "music", id: musicId } : { type: "newMusic" };
  const [selectedNode, setSelectedNode] = useState<SelectedNode>(() => creatingMusic ? { type: "newMusic" } : readSelection(storageKey, fallback, data, canManage, musicId));
  const resolvedNode = isValidSelectedNode(selectedNode, data, canManage) && belongsToMusic(selectedNode, data, musicId) ? selectedNode : fallback;

  useEffect(() => {
    if (resolvedNode.type === "newMusic") return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(resolvedNode));
    } catch {
      // Navigation also works when storage is unavailable.
    }
  }, [storageKey, resolvedNode]);

  const isCreatingMusic = resolvedNode.type === "newMusic";
  const musicHref = musicId !== undefined ? `/admin?musicId=${musicId}` : "/admin";

  const select = (node: SelectedNode) => {
    if (getSelectedNodeKey(node) === getSelectedNodeKey(resolvedNode)) return;
    if (isRefreshing || !confirmAdminNavigation(guard)) return;
    if (node.type === "newMusic") {
      router.push(`${musicHref}${musicId !== undefined ? "&" : "?"}newMusic=1`);
    } else {
      setSelectedNode(node);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || isRefreshing || !confirmAdminNavigation(guard)) return;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setLogoutError("로그아웃에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.container}>
      <Flex className={styles.header} justify="between" align="center" gap="3" wrap="wrap">
        <Flex direction="column" gap="1" minWidth="0">
          <Flex align="center" gap="2">
            <Heading size="5">{isCreatingMusic ? "곡 추가" : "곡 관리"}</Heading>
            <Badge color={canManage ? undefined : "gray"}>{canManage ? "관리자" : "열람 전용"}</Badge>
          </Flex>
          <Text size="2" color="gray">{isCreatingMusic ? "새 곡의 정보와 앨범아트를 등록해 주세요." : music ? `${music.title} · ${music.korTitle}` : "좌측 곡 목록에서 관리할 곡을 선택해 주세요."}</Text>
        </Flex>
        <Flex gap="2" wrap="wrap">
          {canManage && !isCreatingMusic && <Button size="2" variant="soft" disabled={isRefreshing || guard.busy} onClick={() => select({ type: "newMusic" })}>+ 곡 추가</Button>}
          <Button variant="soft" color="gray" loading={isLoggingOut} disabled={isRefreshing || guard.busy} onClick={handleLogout}>로그아웃</Button>
        </Flex>
      </Flex>
      {logoutError && <Text role="alert" color="red" size="2">{logoutError}</Text>}
      <section className={styles.console} data-creating={isCreatingMusic} aria-busy={isRefreshing}>
        {!isCreatingMusic && <Card className={styles.consoleSidebar}>
          <AdminContentNav data={data} musicId={musicId} selectedNode={resolvedNode} canManage={canManage} disabled={isRefreshing || guard.busy} onSelect={select} />
        </Card>}
        <Card className={styles.documentPanel}>
          {music || canManage ? <AdminDocumentPanel
            key={getSelectedNodeKey(resolvedNode)}
            data={data}
            role={role}
            isRefreshing={isRefreshing}
            selectedNode={resolvedNode}
            onCancel={() => router.replace(musicHref)}
            onSaved={(savedMusicId, savedNode) => {
              startTransition(() => {
                if (savedMusicId !== undefined && (savedMusicId !== musicId || isCreatingMusic)) {
                  router.push(`/admin?musicId=${savedMusicId}`);
                } else {
                  if (savedNode) setSelectedNode(savedNode);
                  if (savedMusicId !== undefined) setSelectedNode({ type: "music", id: savedMusicId });
                  router.refresh();
                }
              });
            }}
          /> : <Text color="gray">등록된 곡이 없습니다.</Text>}
        </Card>
      </section>
    </div>
  );
};
