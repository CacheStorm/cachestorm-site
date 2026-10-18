export const BACKGROUND_MOTION_KEY = "cachestorm-background-motion";
const CHANGE = "cachestorm:background-motion";
const QUERY = "(prefers-reduced-motion: reduce)";
let fallback: boolean | undefined;

export function readBackgroundMotion() {
  if (typeof window === "undefined") return false;
  if (fallback !== undefined) return fallback;
  try {
    const saved = window.localStorage.getItem(BACKGROUND_MOTION_KEY);
    if (saved === "on" || saved === "off") return saved === "on";
  } catch {
    // The system preference still works when storage is unavailable.
  }
  return !window.matchMedia(QUERY).matches;
}

export function setBackgroundMotion(enabled: boolean) {
  try {
    window.localStorage.setItem(BACKGROUND_MOTION_KEY, enabled ? "on" : "off");
    fallback = undefined;
  } catch {
    // Keep this tab usable even when a saved value cannot be overwritten.
    fallback = enabled;
  }
  window.dispatchEvent(new Event(CHANGE));
}

export function subscribeBackgroundMotion(callback: () => void) {
  const target = window;
  const motion = target.matchMedia(QUERY);
  function storage(event: StorageEvent) {
    if (event.key !== BACKGROUND_MOTION_KEY && event.key !== null) return;
    fallback = undefined;
    callback();
  }
  target.addEventListener(CHANGE, callback);
  target.addEventListener("storage", storage);
  motion.addEventListener("change", callback);
  return () => {
    target.removeEventListener(CHANGE, callback);
    target.removeEventListener("storage", storage);
    motion.removeEventListener("change", callback);
  };
}
