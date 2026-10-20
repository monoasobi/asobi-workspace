import type { AdminDashboardData, SelectedNode } from "./data";
import {
  isSelectedNode,
  isValidSelectedNode,
  belongsToMusic,
} from "./selection";
export function contentSelection(
  query: Record<string, string | string[] | undefined>,
  data: AdminDashboardData,
  canManage: boolean,
  musicId?: number,
): SelectedNode | null {
  const type = query.type;
  const raw = query.id;
  const candidate = {
    type,
    ...(typeof raw === "string" && /^\d+$/.test(raw)
      ? { id: Number(raw) }
      : {}),
    ...(musicId === undefined ? {} : { musicId }),
  };
  if (
    !isSelectedNode(candidate) ||
    !isValidSelectedNode(candidate, data, canManage)
  )
    return null;
  if (musicId === undefined && !["book", "newBook"].includes(candidate.type))
    return null;
  if (musicId !== undefined && !belongsToMusic(candidate, data, musicId))
    return null;
  if (candidate.type === "music" || candidate.type === "newMusic") return null;
  return candidate;
}
