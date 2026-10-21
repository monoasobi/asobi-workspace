export type RefreshTarget = "monoasobi" | "loudasobi";
export interface RefreshResult {
  target: RefreshTarget;
  ok: boolean;
  error?: string;
  status?: number;
}
