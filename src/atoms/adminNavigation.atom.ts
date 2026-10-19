import { atom } from "jotai";

export const adminNavigationAtom = atom({ dirty: false, busy: false });

export const confirmAdminNavigation = ({ dirty, busy }: { dirty: boolean; busy: boolean }) =>
  !busy && (!dirty || window.confirm("저장하지 않은 변경사항을 버리고 이동할까요?"));
