/** Pause the page's CSS illustrations outside the viewport or in a hidden tab. */
export function bindDecorativeMotion() {
  let active = true;
  const illustrations = document.querySelectorAll<HTMLElement>(
    ".engine-art, .shard-visual, .studio",
  );
  const visible = new Set<Element>();
  const sync = () => {
    if (!active) return;
    for (const illustration of illustrations) {
      illustration.dataset.animationVisible = String(
        visible.has(illustration) && !document.hidden,
      );
    }
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  });
  for (const illustration of illustrations) observer.observe(illustration);
  sync();
  document.addEventListener("visibilitychange", sync);
  return () => {
    active = false;
    observer.disconnect();
    document.removeEventListener("visibilitychange", sync);
    for (const illustration of illustrations)
      delete illustration.dataset.animationVisible;
  };
}
