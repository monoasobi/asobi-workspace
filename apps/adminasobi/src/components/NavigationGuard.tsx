"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
const Context = createContext<{
  dirty: boolean;
  busy: boolean;
  setDirty: (section: string, value: boolean) => void;
  setBusy: (section: string, value: boolean) => void;
  confirmLeave: () => boolean;
} | null>(null);
export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const [dirtySections, setDirtySections] = useState<Record<string, boolean>>(
    {},
  );
  const [busySections, setBusySections] = useState<Record<string, boolean>>({});
  const dirty = Object.values(dirtySections).some(Boolean),
    busy = Object.values(busySections).some(Boolean);
  const setDirty = useCallback(
    (section: string, value: boolean) =>
      setDirtySections((current) =>
        current[section] === value ? current : { ...current, [section]: value },
      ),
    [],
  );
  const setBusy = useCallback(
    (section: string, value: boolean) =>
      setBusySections((current) =>
        current[section] === value ? current : { ...current, [section]: value },
      ),
    [],
  );
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);
  function confirmLeave() {
    return (
      !busy &&
      (!dirty || window.confirm("저장하지 않은 변경사항을 버리고 이동할까요?"))
    );
  }
  return (
    <Context value={{ dirty, busy, setDirty, setBusy, confirmLeave }}>
      {children}
    </Context>
  );
}
export function useNavigationGuard() {
  const value = useContext(Context);
  if (!value) throw new Error("NavigationGuard is required");
  return value;
}
