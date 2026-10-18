import { SITE_FIELD, SiteField, easeOut, projectY } from "./site-field";
import {
  readBackgroundMotion,
  subscribeBackgroundMotion,
} from "./background-motion";

// Turning off tears down the whole controller, including its observers/listeners.
export function bindSiteBackground(
  svg: SVGSVGElement | null,
  interaction: SVGSVGElement | null,
) {
  if (!svg || !interaction) return;
  let stop: (() => void) | undefined;
  let disposed = false;
  function syncPreference() {
    if (disposed) return;
    const enabled = readBackgroundMotion();
    svg!.dataset.enabled = interaction!.dataset.enabled = String(enabled);
    if (enabled && !stop) {
      stop = mountSiteBackground(svg, interaction, {
        respectReducedMotion: false,
      });
    } else if (!enabled && stop) {
      stop();
      stop = undefined;
    }
  }
  const unsubscribe = subscribeBackgroundMotion(syncPreference);
  syncPreference();
  return () => {
    disposed = true;
    unsubscribe();
    stop?.();
  };
}

const NS = "http://www.w3.org/2000/svg";
const CONTROL =
  "a,button,input,textarea,select,label,summary,dialog,[role='dialog'],[role='button'],[role='link'],[role='tab'],[role='radio'],[role='checkbox'],[role='switch'],[role='slider'],[role='menuitem'],[contenteditable]:not([contenteditable='false'])";
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

export function mountSiteBackground(
  svg: SVGSVGElement | null,
  interaction: SVGSVGElement | null,
  { respectReducedMotion = true }: { respectReducedMotion?: boolean } = {},
) {
  const layer = svg?.querySelector<SVGGElement>("[data-field-layer]");
  const interactiveLayer = interaction?.querySelector<SVGGElement>(
    "[data-field-interactive]",
  );
  if (!svg || !layer || !interaction || !interactiveLayer) return;
  const field = new SiteField();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = respectReducedMotion && motion.matches;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let lastFrame = 0;
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
  const links = node(
    "g",
    { class: "field-links", fill: "none" },
    interactiveLayer,
  );
  const effects = node(
    "g",
    { class: "field-effects", fill: "none" },
    interactiveLayer,
  );
  let routeNodes: SVGPathElement[] = [];
  let shapeNodes: SVGGElement[] = [];
  const linkNodes = Array.from({ length: SITE_FIELD.connections }, () =>
    node(
      "path",
      { opacity: "0", "vector-effect": "non-scaling-stroke" },
      links,
    ),
  );
  const rippleNodes = Array.from(
    { length: SITE_FIELD.ripples.max + SITE_FIELD.relays.max },
    () => {
      const group = node("g", { opacity: "0", class: "field-ripple" }, effects);
      return [node("path", {}, group), node("path", { opacity: ".45" }, group)];
    },
  );
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
  const echoes = node(
    "g",
    { class: "field-echoes", fill: "none" },
    interactiveLayer,
  );
  const echoNodes = Array.from({ length: SITE_FIELD.echoes }, () =>
    node(
      "path",
      { opacity: "0", "vector-effect": "non-scaling-stroke" },
      echoes,
    ),
  );
  const focus = node(
    "g",
    { class: "field-focus", opacity: "0" },
    interactiveLayer,
  );
  node(
    "circle",
    {
      r: String(SITE_FIELD.pointerRadius * 0.8),
      fill: interactiveLayer.getAttribute("data-glow") || "none",
      stroke: "none",
    },
    focus,
  );
  node("circle", { r: "23", fill: "none", opacity: ".32" }, focus);
  const focusArc = node(
    "path",
    {
      d: "M-35 0a35 35 0 0 1 35-35M35 0a35 35 0 0 1-35 35",
      fill: "none",
      opacity: ".55",
    },
    focus,
  );

  function edge(x: number, y: number) {
    return Math.max(
      0,
      Math.min(
        1,
        Math.min(x, field.width - x, y, field.height - y) / SITE_FIELD.edgeFade,
      ),
    );
  }
  function ringPath(radius: number) {
    return `M${n(radius)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(-radius * 2)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(radius * 2)} 0`;
  }
  function render() {
    if (disposed) return;
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
    let highlighted = 0;
    const waves = field.waves;
    set(focus, "opacity", n(field.pointer.strength));
    if (field.pointer.strength > 0.01) {
      set(
        focus,
        "transform",
        `translate(${n(field.pointer.x)} ${n(field.pointer.y)})`,
      );
      set(focusArc, "transform", `rotate(${n(field.time * 16)})`);
    }
    field.packets.forEach((packet, i) => {
      const route = field.routes[packet.route];
      const { x, y, angle: direction } = field.position(packet, reduced);
      const item = shapeNodes[i];
      const alpha = edge(x, y);
      set(item, "visibility", alpha ? "visible" : "hidden");
      if (!alpha) return; // Offscreen shapes have no transform/opacity work.
      const size = packet.size * (i % 5 === 0 ? SITE_FIELD.symbolScale : 1);
      const distance = Math.hypot(x - field.pointer.x, y - field.pointer.y);
      const angle =
        i % 5 === 0
          ? reduced
            ? 0
            : Math.sin(field.time * 0.65 + packet.phase) *
              (12 +
                Math.max(0, 1 - distance / SITE_FIELD.pointerRadius) *
                  field.pointer.strength *
                  18)
          : (direction * 180) / Math.PI;
      set(
        item,
        "transform",
        `translate(${n(x)} ${n(y)}) rotate(${n(angle)}) scale(${n(size)})`,
      );
      set(item, "opacity", n(alpha * (0.35 + route.depth * 0.55)));
      let reaction = Math.max(
        packet.pulse,
        Math.max(0, 1 - distance / SITE_FIELD.pointerRadius) ** 1.4 *
          field.pointer.strength,
      );
      for (const ripple of waves) {
        const t = ripple.age / ripple.life;
        const radius = easeOut(t) * ripple.radius;
        const waveDistance = Math.hypot(x - ripple.x, y - ripple.y);
        reaction = Math.max(
          reaction,
          Math.max(
            0,
            1 - Math.abs(waveDistance - radius) / SITE_FIELD.waveWidth,
          ) *
            (1 - t) *
            ripple.gain,
        );
      }
      if (
        reaction > 0.01 &&
        highlighted < (field.mobile ? 6 : echoNodes.length)
      ) {
        const echo = echoNodes[highlighted++];
        set(echo, "d", SHAPES[i % 5 === 0 ? (i / 5) % SHAPES.length : 0]);
        set(
          echo,
          "transform",
          `translate(${n(x)} ${n(y)}) rotate(${n(angle)}) scale(${n(Math.max(5, size * 1.18))})`,
        );
        set(echo, "opacity", n(alpha * reaction * 0.95));
      }
      if (
        field.pointer.strength > 0.02 &&
        connections < (field.mobile ? 2 : linkNodes.length)
      ) {
        if (distance < SITE_FIELD.pointerRadius) {
          const link = linkNodes[connections++];
          const bend = 0.16 + Math.sin(field.time * 0.8 + packet.phase) * 0.05;
          set(
            link,
            "d",
            `M${n(x)} ${n(y)}Q${n((x + field.pointer.x) / 2 - (y - field.pointer.y) * bend)} ${n((y + field.pointer.y) / 2 + (x - field.pointer.x) * bend)} ${n(field.pointer.x)} ${n(field.pointer.y)}`,
          );
          set(
            link,
            "opacity",
            n(
              (1 - distance / SITE_FIELD.pointerRadius) *
                field.pointer.strength *
                alpha *
                0.8,
            ),
          );
        }
      }
    });
    for (; highlighted < echoNodes.length; highlighted++)
      set(echoNodes[highlighted], "opacity", "0");
    for (; connections < linkNodes.length; connections++)
      set(linkNodes[connections], "opacity", "0");
    rippleNodes.forEach(([outer, inner], i) => {
      const ripple = waves[i];
      const group = outer.parentElement!;
      if (!ripple) {
        set(group, "opacity", "0");
        return;
      }
      const t = ripple.age / ripple.life;
      const radius = 3 + easeOut(t) * ripple.radius;
      set(group, "transform", `translate(${n(ripple.x)} ${n(ripple.y)})`);
      const breathing = Math.sin(t * Math.PI);
      set(
        outer,
        "transform",
        `scale(${n(1 + breathing * 0.02)} ${n(1 - breathing * 0.015)})`,
      );
      set(group, "data-generation", String(ripple.generation));
      set(
        group,
        "opacity",
        n((1 - t) ** 2 * Math.min(1, t * 16) * ripple.gain),
      );
      set(inner, "opacity", ripple.generation ? "0" : ".45");
      set(outer, "d", ringPath(radius));
      set(
        inner,
        "d",
        ringPath(
          radius *
            (ripple.variant === 2 ? 0.65 : ripple.variant === 1 ? 0.82 : 0.9),
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
        `translate(${n(trail.x)} ${n(trail.y)}) scale(${n(4 + easeOut(t) * 18)})`,
      );
      set(item, "opacity", n(edge(trail.x, trail.y) * (1 - t) ** 2 * 0.7));
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
    svg!.dataset.motion = interaction!.dataset.motion =
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
    set(interaction!, "viewBox", `0 0 ${n(field.width)} ${n(field.height)}`);
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
    render();
    sync();
  }
  function blocked(event: PointerEvent) {
    return event.target instanceof Element && !!event.target.closest(CONTROL);
  }
  function move(event: PointerEvent) {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8)
      down.moved = true;
    if (reduced || event.pointerType === "touch") {
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
    down = null;
    // Client coordinates stay viewport-relative even while the document scrolls.
    if (!reduced && field.pointer.inside)
      field.move(field.pointer.x, field.pointer.y);
    if (reduced && visible && !document.hidden) render();
  }
  function updateMotion() {
    reduced = respectReducedMotion && motion.matches;
    field.clearInteraction();
    field.scroll = field.scrollTarget = reduced ? 0 : window.scrollY;
    sync();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  const size = new ResizeObserver(resize);
  intersection.observe(svg);
  size.observe(svg);
  document.addEventListener("pointermove", move, {
    passive: true,
    capture: true,
  });
  document.addEventListener("pointerdown", pointerDown, {
    passive: true,
    capture: true,
  });
  document.addEventListener("pointerup", pointerUp, {
    passive: true,
    capture: true,
  });
  document.addEventListener("pointercancel", leave);
  document.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("blur", leave);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  if (respectReducedMotion) motion.addEventListener("change", updateMotion);
  resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    size.disconnect();
    document.removeEventListener("pointermove", move, { capture: true });
    document.removeEventListener("pointerdown", pointerDown, { capture: true });
    document.removeEventListener("pointerup", pointerUp, { capture: true });
    document.removeEventListener("pointercancel", leave);
    document.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("blur", leave);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", scroll);
    if (respectReducedMotion)
      motion.removeEventListener("change", updateMotion);
    layer.replaceChildren();
    interactiveLayer.replaceChildren();
    delete svg.dataset.motion;
    delete interaction.dataset.motion;
  };
}
