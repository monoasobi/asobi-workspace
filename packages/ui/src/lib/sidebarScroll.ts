const positions = new Map<string, number>();
const adminScrollKey = "loudasobi_admin_sidebar_scroll";

export function readSidebarScroll(key: string) {
  if (key === "admin") {
    try {
      const value: unknown = JSON.parse(
        sessionStorage.getItem(adminScrollKey) ?? "null",
      );
      if (typeof value === "number" && Number.isFinite(value) && value >= 0)
        return value;
    } catch {
      // Fall back to the position retained in this page session.
    }
  }
  return positions.get(key) ?? 0;
}

export function writeSidebarScroll(key: string, top: number) {
  positions.set(key, top);
  if (key === "admin") {
    try {
      sessionStorage.setItem(adminScrollKey, JSON.stringify(top));
    } catch {
      // A blocked session store must not interrupt scrolling.
    }
  }
}
