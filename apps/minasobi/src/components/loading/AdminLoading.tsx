"use client";

import { usePathname } from "next/navigation";
import {
  AdminFrameSkeleton,
  AdminPageSkeleton,
  GuideSkeleton,
} from "./AdminSkeletons";
import { EditorLoading } from "./EditorLoading";

export function AdminPageLoading() {
  const path = usePathname();
  if (/\/(lyrics|calls)$/.test(path)) return <EditorLoading />;
  if (path === "/guide") return <GuideSkeleton />;
  const kind =
    path === "/books"
      ? "books"
      : path === "/sidebar"
        ? "list"
        : path === "/musics/deleted"
          ? "deleted"
          : path === "/musics/new"
            ? "form"
            : "music";
  return <AdminPageSkeleton kind={kind} />;
}

export function AdminFrameLoading() {
  return (
    <AdminFrameSkeleton>
      <AdminPageLoading />
    </AdminFrameSkeleton>
  );
}
