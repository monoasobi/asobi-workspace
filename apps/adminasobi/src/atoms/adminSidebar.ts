import { atomWithStorage } from "jotai/utils";
import { z } from "zod";

const sidebarStateSchema = z.object({
  collapsed: z.boolean().default(false),
  sort: z.enum(["recommended", "album", "release"]),
  expandedGroups: z.object({
    recommended: z.array(z.string()).max(100),
    album: z.array(z.string()).max(100),
  }),
});
type SidebarState = z.infer<typeof sidebarStateSchema>;

export const initialAdminSidebar: SidebarState = {
  collapsed: false,
  sort: "recommended",
  expandedGroups: { recommended: [], album: [] },
};

export const adminSidebarAtom = atomWithStorage<SidebarState | null>(
  "adminasobi_sidebar",
  null,
  {
    getItem(key) {
      try {
        const result = sidebarStateSchema.safeParse(
          JSON.parse(sessionStorage.getItem(key) ?? "null"),
        );
        return result.success ? result.data : initialAdminSidebar;
      } catch {
        return initialAdminSidebar;
      }
    },
    setItem(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Keep navigation usable when browser storage is unavailable.
      }
    },
    removeItem(key) {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Resetting the in-memory state does not require storage access.
      }
    },
  },
);
