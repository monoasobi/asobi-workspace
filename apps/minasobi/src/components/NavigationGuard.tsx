"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useTransition,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { installHistoryGuard } from "./NavigationGuard/history";
const Context = createContext<{
  pending: boolean;
  router: ReturnType<typeof useRouter>;
  dirty: boolean;
  busy: boolean;
  setDirty: (section: string, value: boolean) => void;
  setBusy: (section: string, value: boolean) => void;
  confirmLeave: () => boolean;
} | null>(null);
export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const nativeRouter = useRouter();
  const [pending, startTransition] = useTransition();
  const router = useMemo(() => ({
    ...nativeRouter,
    push: (...args: Parameters<typeof nativeRouter.push>) => startTransition(() => nativeRouter.push(...args)),
    replace: (...args: Parameters<typeof nativeRouter.replace>) => startTransition(() => nativeRouter.replace(...args)),
    refresh: () => startTransition(() => nativeRouter.refresh()),
  }), [nativeRouter]);
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
  const confirmLeave = useCallback(() => {
    return (
      !busy &&
      (!dirty || window.confirm("저장하지 않은 변경사항을 버리고 이동할까요?"))
    );
  }, [busy, dirty]);
  const latest = useRef(confirmLeave);
  useLayoutEffect(() => {
    latest.current = confirmLeave;
  }, [confirmLeave]);
  useEffect(() => installHistoryGuard(() => latest.current()), []);
  return (
    <Context value={{ dirty, busy, setDirty, setBusy, confirmLeave, pending, router }}>
      {children}
    </Context>
  );
}
export function useNavigationGuard() {
  const value = useContext(Context);
  if (!value) throw new Error("NavigationGuard is required");
  return value;
}

export function useLoadingRouter() {
  return useNavigationGuard().router;
}
