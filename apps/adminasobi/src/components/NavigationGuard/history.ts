// Preserve Next's own history fields; the guard owns only this extra position.
const positionKey = "asobiAdminPosition";
type NavigationInfo = EventTarget & { currentEntry?: { index: number } };
type EntryChange = Event & { navigationType?: string | null };

export const restoreHistoryDelta = (current: number, target: number) =>
  current - target;

export function installHistoryGuard(confirmLeave: () => boolean) {
  const history = window.history;
  const navigation = (window as Window & { navigation?: NavigationInfo })
    .navigation;
  const nativeIndex = () => navigation?.currentEntry?.index;
  let position = nativeIndex() ?? history.state?.[positionKey] ?? 0;
  let restoring = false;
  let savedState: unknown = history.state;
  let savedUrl = window.location.href;
  const push = history.pushState,
    replace = history.replaceState;
  const stamp = (value: unknown, index: number) => ({
    ...(value && typeof value === "object" ? value : {}),
    [positionKey]: index,
  });
  function remember() {
    savedState = history.state;
    savedUrl = window.location.href;
  }
  const patchedPush: History["pushState"] = function (data, unused, url) {
    push.call(history, stamp(data, position + 1), unused, url);
    position += 1;
    remember();
  };
  const patchedReplace: History["replaceState"] = function (data, unused, url) {
    replace.call(history, stamp(data, position), unused, url);
    remember();
  };
  function entryChange(event: Event) {
    if ((event as EntryChange).navigationType === "traverse") return;
    position = nativeIndex() ?? position;
    remember();
  }
  if (navigation?.currentEntry) {
    // Modern Navigation API also knows positions for old, unstamped entries.
    navigation.addEventListener("currententrychange", entryChange);
  } else {
    replace.call(history, stamp(history.state, position), "");
    remember();
    history.pushState = patchedPush;
    history.replaceState = patchedReplace;
  }
  function pop(event: PopStateEvent) {
    const target: number | undefined =
      nativeIndex() ?? event.state?.[positionKey];
    if (restoring) {
      event.stopImmediatePropagation();
      if (target === position) restoring = false;
      else if (typeof target === "number")
        history.go(restoreHistoryDelta(position, target));
      return;
    }
    if (!confirmLeave()) {
      // Capture before App Router can unmount the editor and lose its draft.
      event.stopImmediatePropagation();
      if (typeof target === "number" && target !== position) {
        restoring = true;
        history.go(restoreHistoryDelta(position, target));
      } else {
        // Legacy browser + an entry created before the guard: preserve the draft
        // by re-recording the current URL. This fallback may discard forward history.
        position += 1;
        push.call(history, stamp(savedState, position), "", savedUrl);
        remember();
      }
      return;
    }
    position = target ?? position;
    remember();
  }
  window.addEventListener("popstate", pop, true);
  return () => {
    window.removeEventListener("popstate", pop, true);
    navigation?.removeEventListener("currententrychange", entryChange);
    if (history.pushState === patchedPush) history.pushState = push;
    if (history.replaceState === patchedReplace) history.replaceState = replace;
  };
}
