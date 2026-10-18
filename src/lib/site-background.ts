import {
  SITE_FIELD,
  SiteField,
  easeOut,
  projectY,
  routePoint,
} from "./site-field";

const NS = "http://www.w3.org/2000/svg";
const CONTROL =
  "a,button,input,textarea,select,label,summary,dialog,[role='button'],[role='link'],[role='tab'],[role='radio'],[role='checkbox'],[role='switch'],[role='slider'],[role='menuitem'],[contenteditable]:not([contenteditable='false']),.site-header,.docs-sidebar,pre,code";
const QUIET =
  ".hero-copy,.prose,.page-hero,.section-heading,.command-intro,.panel-intro,.docs-sidebar,.doc-content > h1,.doc-description,.faq-section > div:first-child";
const SHAPES = [
  "M0-1 1 0 0 1-1 0Z",
  "M-1-.6 0-1.2 1-.6 1 .6 0 1.2-1 .6ZM-1-.6 0 0 1-.6M0 0v1.2",
  "M.3-1.2-1 .3H0L-.3 1.2 1-.3H0Z",
  "M-1-1H1V1H-1ZM-1 0H1M0-1V1",
];
const n = (value: number) => value.toFixed(2);

// Avoid SVG invalidations for idle routes and inactive effect slots.
const attributes = new WeakMap<Element, Map<string, string>>();
function set(item: Element, name: string, value: string) {
  let previous = attributes.get(item);
  if (!previous) {
    previous = new Map();
    attributes.set(item, previous);
  }
  if (previous.get(name) === value) return;
  item.setAttribute(name, value);
  previous.set(name, value);
}

export function mountSiteBackground(svg: SVGSVGElement | null) {
  const layer = svg?.querySelector<SVGGElement>("[data-field-layer]");
  const quietLayer = svg?.querySelector<SVGGElement>("[data-field-quiet]");
  if (!svg || !layer || !quietLayer) return;
  const field = new SiteField();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let lastFrame = 0;
  let quietDirty = true;
  let quietElements: Element[] = [];
  let down: { x: number; y: number; id: number; moved: boolean } | null = null;

  function node<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Record<string, string>,
    parent: SVGElement = layer!,
  ) {
    const item = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) set(item, key, value);
    parent.appendChild(item);
    return item;
  }
  const routes = node("g", { class: "field-routes", fill: "none" });
  const shapes = node("g", { class: "field-shapes", fill: "none" });
  const links = node("g", { class: "field-links", fill: "none" });
  const effects = node("g", { class: "field-effects", fill: "none" });
  let routeNodes: SVGPathElement[] = [];
  let shapeNodes: SVGGElement[] = [];
  const linkNodes = Array.from({ length: 4 }, () =>
    node(
      "path",
      { opacity: "0", "vector-effect": "non-scaling-stroke" },
      links,
    ),
  );
  const rippleNodes = Array.from({ length: SITE_FIELD.ripples.max }, () => {
    const group = node("g", { opacity: "0", class: "field-ripple" }, effects);
    return [node("path", {}, group), node("path", { opacity: ".45" }, group)];
  });
  const sparkNodes = Array.from({ length: SITE_FIELD.sparks.max }, () =>
    node("path", { d: SHAPES[0], opacity: "0", class: "field-spark" }, effects),
  );
  const trailNodes = Array.from({ length: SITE_FIELD.trails.max }, () =>
    node(
      "path",
      {
        d: SHAPES[1],
        opacity: "0",
        class: "field-trail",
        "vector-effect": "non-scaling-stroke",
      },
      effects,
    ),
  );
  const quietNodes = Array.from({ length: SITE_FIELD.quietRegions }, () =>
    node("rect", { fill: "black", opacity: "0", rx: "28" }, quietLayer!),
  );

  function measureQuiet() {
    let count = 0;
    for (const element of quietElements) {
      if (count === quietNodes.length) break;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > field.height || !rect.width) continue;
      const item = quietNodes[count++];
      set(item, "x", n(rect.left - 18));
      set(item, "y", n(rect.top - 18));
      set(item, "width", n(rect.width + 36));
      set(item, "height", n(rect.height + 36));
      set(item, "opacity", ".87");
    }
    for (; count < quietNodes.length; count++)
      set(quietNodes[count], "opacity", "0");
    quietDirty = false;
  }
  function refreshQuiet() {
    quietElements = Array.from(document.querySelectorAll(QUIET));
    quietDirty = true;
  }
  function edge(x: number, y: number) {
    return Math.max(
      0,
      Math.min(
        1,
        Math.min(x, field.width - x, y, field.height - y) / SITE_FIELD.edgeFade,
      ),
    );
  }
  function ringPath(radius: number, hex: boolean) {
    if (!hex)
      return `M${n(radius)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(-radius * 2)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(radius * 2)} 0`;
    return (
      Array.from(
        { length: 6 },
        (_, i) =>
          `${i ? "L" : "M"}${n(Math.cos((i * Math.PI) / 3) * radius)} ${n(Math.sin((i * Math.PI) / 3) * radius)}`,
      ).join("") + "Z"
    );
  }
  function render() {
    if (disposed) return;
    if (quietDirty) measureQuiet();
    const scroll = reduced ? 0 : field.scroll;
    field.routes.forEach((route, i) => {
      const first = projectY(route, route.points[0].y, scroll, field.height);
      const node = routeNodes[i];
      const shift = first - route.points[0].y;
      const ys = route.points.map((p) => p.y + shift);
      const shown = Math.max(...ys) >= 0 && Math.min(...ys) <= field.height;
      set(node, "visibility", shown ? "visible" : "hidden");
      if (shown)
        set(
          node,
          "d",
          route.points
            .map(
              (p, j) =>
                `${j ? "L" : "M"}${n(p.x)} ${n(projectY(route, p.y, scroll, field.height))}`,
            )
            .join(""),
        );
    });
    let connections = 0;
    field.packets.forEach((packet, i) => {
      const route = field.routes[packet.route];
      const p = routePoint(route, packet.distance);
      const x = p.x + packet.offset.x;
      const y =
        projectY(route, p.y, scroll, field.height) +
        packet.offset.y +
        (reduced ? 0 : Math.sin(field.time * 0.4 + i) * 5 * route.depth);
      const item = shapeNodes[i];
      const alpha = edge(x, y);
      set(item, "visibility", alpha ? "visible" : "hidden");
      if (!alpha) return; // Offscreen shapes have no transform/opacity work.
      const size = packet.size * (i % 5 === 0 ? SITE_FIELD.symbolScale : 1);
      const angle =
        i % 5 === 0
          ? reduced
            ? 0
            : Math.sin(field.time * 0.12 + i) * 12
          : (p.angle * 180) / Math.PI;
      set(
        item,
        "transform",
        `translate(${n(x)} ${n(y)}) rotate(${n(angle)}) scale(${n(size)})`,
      );
      set(item, "opacity", n(alpha * (0.35 + route.depth * 0.55)));
      if (
        field.pointer.strength > 0.02 &&
        connections < (field.mobile ? 2 : linkNodes.length)
      ) {
        const distance = Math.hypot(x - field.pointer.x, y - field.pointer.y);
        if (distance < SITE_FIELD.pointerRadius) {
          const link = linkNodes[connections++];
          set(
            link,
            "d",
            `M${n(x)} ${n(y)}L${n(field.pointer.x)} ${n(field.pointer.y)}`,
          );
          set(
            link,
            "opacity",
            n(
              (1 - distance / SITE_FIELD.pointerRadius) *
                field.pointer.strength *
                alpha,
            ),
          );
        }
      }
    });
    for (; connections < linkNodes.length; connections++)
      set(linkNodes[connections], "opacity", "0");
    rippleNodes.forEach(([outer, inner], i) => {
      const ripple = field.ripples[i];
      const group = outer.parentElement!;
      if (!ripple) {
        set(group, "opacity", "0");
        return;
      }
      const t = ripple.age / ripple.life;
      const radius = 3 + easeOut(t) * field.rippleRadius;
      set(group, "transform", `translate(${n(ripple.x)} ${n(ripple.y)})`);
      set(group, "opacity", n((1 - t) ** 2 * Math.min(1, t * 16)));
      set(outer, "d", ringPath(radius, ripple.variant === 1));
      set(
        inner,
        "d",
        ringPath(
          radius * (ripple.variant === 2 ? 0.65 : 0.9),
          ripple.variant === 1,
        ),
      );
    });
    sparkNodes.forEach((item, i) => {
      const spark = field.sparks[i];
      if (!spark) {
        set(item, "opacity", "0");
        return;
      }
      const t = spark.age / spark.life;
      set(
        item,
        "transform",
        `translate(${n(spark.x)} ${n(spark.y)}) scale(${n(1 + (1 - t) * 2)})`,
      );
      set(
        item,
        "opacity",
        n(edge(spark.x, spark.y) * (1 - t) ** 2 * Math.min(1, t * 20)),
      );
    });
    trailNodes.forEach((item, i) => {
      const trail = field.trails[i];
      if (!trail) {
        set(item, "opacity", "0");
        return;
      }
      const t = trail.age / trail.life;
      set(
        item,
        "transform",
        `translate(${n(trail.x)} ${n(trail.y)}) scale(${n(3 + easeOut(t) * 12)})`,
      );
      set(item, "opacity", n(edge(trail.x, trail.y) * (1 - t) ** 2 * 0.4));
    });
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced) return;
    const fps = field.mobile
      ? SITE_FIELD.fps.mobile
      : field.intensity > 0.05
        ? SITE_FIELD.fps.active
        : SITE_FIELD.fps.idle;
    if (!lastFrame || now - lastFrame >= 1000 / fps - 1) {
      field.step(lastFrame ? (now - lastFrame) / 1000 : 0);
      lastFrame = now;
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (disposed) return;
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    svg!.dataset.motion =
      !visible || document.hidden ? "paused" : reduced ? "reduced" : "running";
    if (!visible || document.hidden || disposed) {
      field.leave();
      down = null;
      return;
    }
    if (reduced) {
      field.clearInteraction();
      render();
    } else frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed) return;
    const bounds = svg!.getBoundingClientRect();
    if (bounds.width === field.width && bounds.height === field.height) return;
    field.resize(bounds.width, bounds.height);
    field.scroll = field.scrollTarget = reduced ? 0 : window.scrollY;
    set(svg!, "viewBox", `0 0 ${n(field.width)} ${n(field.height)}`);
    routes.replaceChildren();
    shapes.replaceChildren();
    routeNodes = field.routes.map(() => node("path", {}, routes));
    shapeNodes = field.packets.map((_, i) => {
      const group = node("g", {}, shapes);
      node(
        "path",
        {
          d: SHAPES[i % 5 === 0 ? (i / 5) % SHAPES.length : 0],
          "vector-effect": "non-scaling-stroke",
        },
        group,
      );
      if (i % 5 !== 0)
        node(
          "path",
          {
            d: "M-5 0H-1",
            class: "field-tail",
            "vector-effect": "non-scaling-stroke",
          },
          group,
        );
      return group;
    });
    refreshQuiet();
    render();
    sync();
  }
  function blocked(event: PointerEvent) {
    return event.target instanceof Element && !!event.target.closest(CONTROL);
  }
  function move(event: PointerEvent) {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8)
      down.moved = true;
    if (reduced || event.pointerType === "touch" || blocked(event)) {
      field.leave();
      return;
    }
    field.move(event.clientX, event.clientY);
  }
  function pointerDown(event: PointerEvent) {
    down = null;
    if (
      reduced ||
      !visible ||
      event.button !== 0 ||
      !event.isPrimary ||
      blocked(event)
    )
      return;
    down = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      moved: false,
    };
  }
  function pointerUp(event: PointerEvent) {
    const candidate = down;
    down = null;
    if (
      !candidate ||
      candidate.moved ||
      candidate.id !== event.pointerId ||
      reduced ||
      blocked(event) ||
      !window.getSelection()?.isCollapsed
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest("h1,h2,h3,p,pre,code")
    )
      return;
    if (
      Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y) <= 8
    )
      field.burst(event.clientX, event.clientY);
  }
  function leave() {
    field.leave();
    down = null;
  }
  function scroll() {
    field.scrollTarget = window.scrollY;
    quietDirty = true;
    leave();
    if (reduced && visible && !document.hidden) render();
  }
  function updateMotion() {
    reduced = motion.matches;
    field.clearInteraction();
    field.scroll = field.scrollTarget = reduced ? 0 : window.scrollY;
    sync();
  }
  function changed() {
    refreshQuiet();
    if (reduced && visible && !document.hidden) render();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  const size = new ResizeObserver(resize);
  const content = new MutationObserver(changed);
  const main = document.querySelector("main");
  if (main) content.observe(main, { childList: true, subtree: true });
  intersection.observe(svg);
  size.observe(svg);
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerdown", pointerDown, { passive: true });
  document.addEventListener("pointerup", pointerUp, { passive: true });
  document.addEventListener("pointercancel", leave);
  document.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("blur", leave);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  motion.addEventListener("change", updateMotion);
  resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    size.disconnect();
    content.disconnect();
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerdown", pointerDown);
    document.removeEventListener("pointerup", pointerUp);
    document.removeEventListener("pointercancel", leave);
    document.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("blur", leave);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", scroll);
    motion.removeEventListener("change", updateMotion);
    layer.replaceChildren();
    quietLayer.replaceChildren();
    delete svg.dataset.motion;
  };
}
