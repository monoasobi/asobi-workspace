import { atomWithStorage } from "jotai/utils";

export const sidebarOpenAtom = atomWithStorage<boolean>(
  "loudasobi_sidebar_open",
  true,
  {
    getItem(key, initialValue) {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
        return typeof value === "boolean" ? value : initialValue;
      } catch {
        return initialValue;
      }
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Keep the sidebar usable when browser storage is unavailable.
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Resetting the in-memory state does not require storage access.
      }
    },
  },
);
