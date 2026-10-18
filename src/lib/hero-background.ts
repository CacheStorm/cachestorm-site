import {
  HERO_FIELD,
  HeroField,
  easeOut,
  routePoint,
  type Point,
} from "./hero-field";

const controls =
  "a, button, input, textarea, select, label, summary, [role='button'], [contenteditable='true']";

export function mountHeroBackground(canvas: HTMLCanvasElement | null) {
  const host = canvas?.closest<HTMLElement>("[data-hero-scene]");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !host || !ctx) return;

  const field = new HeroField();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  let reduced = motion.matches;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let lastFrame = 0;
  let dpr = 1;
  let copy = { left: 0, right: 0, top: 0, bottom: 0 };
  let down: { x: number; y: number; id: number; moved: boolean } | null = null;
  const theme = () => {
    const choice = document.documentElement.dataset.theme;
    return choice === "dark" || (choice !== "light" && systemDark.matches)
      ? "dark"
      : "light";
  };
  let target = HERO_FIELD.colors[theme()];
  const palette = {
    line: [...target.line],
    packet: [...target.packet],
    glow: [...target.glow],
    opacity: target.opacity as number,
  };

  function alpha(x: number, y: number) {
    const edge = Math.min(x, y, field.width - x, field.height - y);
    const fade = Math.max(0, Math.min(1, edge / HERO_FIELD.edgeFade));
    const dx = Math.max(copy.left - x, 0, x - copy.right);
    const dy = Math.max(copy.top - y, 0, y - copy.bottom);
    return fade * (0.12 + 0.88 * Math.min(1, Math.hypot(dx, dy) / 110));
  }

  const color = (rgb: readonly number[], opacity: number) =>
    `rgba(${rgb.map(Math.round).join(",")},${Math.max(0, opacity * palette.opacity)})`;
  function diamond(x: number, y: number, size: number) {
    ctx!.beginPath();
    ctx!.moveTo(x, y - size * 0.6);
    ctx!.lineTo(x + size, y);
    ctx!.lineTo(x, y + size * 0.6);
    ctx!.lineTo(x - size, y);
    ctx!.closePath();
  }
  function ring(p: Point, radius: number, hex: boolean) {
    ctx!.beginPath();
    if (hex) {
      for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = p.x + Math.cos(angle) * radius;
        const y = p.y + Math.sin(angle) * radius;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
    } else ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx!.stroke();
  }

  function draw(dt = 0) {
    if (!canvas || !ctx) return;
    const blend = reduced ? 1 : 1 - Math.exp(-dt * 6);
    for (const key of ["line", "packet", "glow"] as const) {
      for (let i = 0; i < 3; i++)
        palette[key][i] += (target[key][i] - palette[key][i]) * blend;
    }
    palette.opacity += (target.opacity - palette.opacity) * blend;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, field.width, field.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Fixed circuit routes and isometric memory cells, spread over the full hero.
    for (const route of field.routes) {
      for (let i = 1; i < route.points.length; i++) {
        const a = route.points[i - 1];
        const b = route.points[i];
        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(
          0,
          color(palette.line, alpha(a.x, a.y) * 0.19 * route.depth),
        );
        gradient.addColorStop(
          0.5,
          color(
            palette.line,
            alpha((a.x + b.x) / 2, (a.y + b.y) / 2) * 0.19 * route.depth,
          ),
        );
        gradient.addColorStop(
          1,
          color(palette.line, alpha(b.x, b.y) * 0.19 * route.depth),
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        if (i < route.points.length - 1) {
          ctx.strokeStyle = color(palette.line, alpha(b.x, b.y) * 0.4);
          diamond(b.x, b.y, 5 + route.depth * 3);
          ctx.stroke();
        }
      }
    }
    let connected = 0;
    for (const packet of field.packets) {
      const route = field.routes[packet.route];
      const p = routePoint(route, packet.distance);
      const x = p.x + packet.offset.x;
      const y =
        p.y +
        packet.offset.y +
        (reduced
          ? 0
          : Math.sin(field.time * 0.5 + packet.distance * 0.01) *
            3 *
            route.depth);
      const opacity = alpha(x, y) * (0.4 + route.depth * 0.4);
      ctx.strokeStyle = color(palette.packet, opacity * 0.45);
      ctx.lineWidth = packet.size * 0.55;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(p.angle) * 22, y - Math.sin(p.angle) * 22);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = color(palette.packet, opacity);
      diamond(x, y, packet.size);
      ctx.fill();
      if (field.pointer.strength > 0.02 && connected < (field.mobile ? 2 : 4)) {
        const distance = Math.hypot(x - field.pointer.x, y - field.pointer.y);
        if (distance < HERO_FIELD.pointerRadius) {
          ctx.strokeStyle = color(
            palette.glow,
            opacity *
              field.pointer.strength *
              (1 - distance / HERO_FIELD.pointerRadius) *
              0.5,
          );
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(field.pointer.x, field.pointer.y);
          ctx.stroke();
          connected++;
        }
      }
    }
    for (const trail of field.trails) {
      const t = trail.age / trail.life;
      ctx.strokeStyle = color(
        palette.glow,
        alpha(trail.x, trail.y) * (1 - t) ** 2 * 0.22,
      );
      ctx.lineWidth = 0.7;
      diamond(trail.x, trail.y, 3 + easeOut(t) * 15);
      ctx.stroke();
    }
    for (const ripple of field.ripples) {
      const t = ripple.age / ripple.life;
      const radius = 8 + easeOut(t) * field.rippleRadius;
      const fadeIn = Math.min(1, t * 16);
      // The entire transient layer also fades smoothly at the hero boundary.
      ctx.save();
      const glow = ctx.createRadialGradient(
        ripple.x,
        ripple.y,
        0,
        ripple.x,
        ripple.y,
        radius,
      );
      glow.addColorStop(0, color(palette.glow, 0));
      glow.addColorStop(0.8, color(palette.glow, 0.035 * (1 - t) * fadeIn));
      glow.addColorStop(1, color(palette.glow, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(
        ripple.x - radius,
        ripple.y - radius,
        radius * 2,
        radius * 2,
      );
      ctx.strokeStyle = color(palette.packet, (1 - t) ** 2 * 0.7 * fadeIn);
      ctx.lineWidth = 1.5 * (1 - t) + 0.4;
      ring(ripple, radius, ripple.variant === 1);
      ctx.strokeStyle = color(palette.glow, (1 - t) ** 2 * 0.3 * fadeIn);
      ring(
        ripple,
        radius * (ripple.variant === 2 ? 0.65 : 0.9),
        ripple.variant === 1,
      );
      ctx.restore();
    }
    for (const spark of field.sparks) {
      const t = spark.age / spark.life;
      ctx.fillStyle = color(
        palette.packet,
        alpha(spark.x, spark.y) * (1 - t) ** 2 * Math.min(1, t * 20),
      );
      diamond(spark.x, spark.y, 2.5 * (1 - t) + 0.5);
      ctx.fill();
    }
    // Keep even large click waves quiet behind the text and controls.
    ctx.globalCompositeOperation = "destination-out";
    const copyMask = ctx.createLinearGradient(
      copy.left - 40,
      0,
      copy.right + 60,
      0,
    );
    copyMask.addColorStop(0, "transparent");
    copyMask.addColorStop(0.12, "rgba(0,0,0,.86)");
    copyMask.addColorStop(0.85, "rgba(0,0,0,.86)");
    copyMask.addColorStop(1, "transparent");
    ctx.fillStyle = copyMask;
    ctx.fillRect(
      copy.left - 40,
      copy.top - 30,
      copy.right - copy.left + 100,
      copy.bottom - copy.top + 60,
    );
    // Destination-in fades waves at all four hero boundaries.
    ctx.globalCompositeOperation = "destination-in";
    const edgeX = ctx.createLinearGradient(0, 0, field.width, 0);
    const stopX = Math.min(0.2, HERO_FIELD.edgeFade / field.width);
    edgeX.addColorStop(0, "transparent");
    edgeX.addColorStop(stopX, "#000");
    edgeX.addColorStop(1 - stopX, "#000");
    edgeX.addColorStop(1, "transparent");
    ctx.fillStyle = edgeX;
    ctx.fillRect(0, 0, field.width, field.height);
    const edgeY = ctx.createLinearGradient(0, 0, 0, field.height);
    const stopY = Math.min(0.2, HERO_FIELD.edgeFade / field.height);
    edgeY.addColorStop(0, "transparent");
    edgeY.addColorStop(stopY, "#000");
    edgeY.addColorStop(1 - stopY, "#000");
    edgeY.addColorStop(1, "transparent");
    ctx.fillStyle = edgeY;
    ctx.fillRect(0, 0, field.width, field.height);
    ctx.globalCompositeOperation = "source-over";
  }

  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced) return;
    const fps = field.mobile
      ? HERO_FIELD.fps.mobile
      : field.intensity > 0.05
        ? HERO_FIELD.fps.active
        : HERO_FIELD.fps.idle;
    if (!lastFrame || now - lastFrame >= 1000 / fps - 1) {
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
      lastFrame = now;
      field.step(dt);
      draw(dt);
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    const paused = !visible || document.hidden;
    host!.dataset.scenePaused = String(paused);
    canvas!.dataset.motion = paused
      ? "paused"
      : reduced
        ? "reduced"
        : "running";
    if (paused || disposed) {
      field.leave();
      down = null;
      return;
    }
    if (reduced) {
      field.clearInteraction();
      draw();
    } else frame = requestAnimationFrame(tick);
  }

  function resize() {
    const bounds = host!.getBoundingClientRect();
    field.resize(bounds.width, bounds.height);
    dpr = Math.min(
      window.devicePixelRatio || 1,
      HERO_FIELD.maxDpr,
      Math.sqrt(HERO_FIELD.maxPixels / (field.width * field.height)),
    );
    canvas!.width = Math.round(field.width * dpr);
    canvas!.height = Math.round(field.height * dpr);
    const text = host!.querySelector(".hero-copy")?.getBoundingClientRect();
    if (text)
      copy = {
        left: text.left - bounds.left - 18,
        right: text.right - bounds.left + 18,
        top: text.top - bounds.top - 12,
        bottom: text.bottom - bounds.top + 12,
      };
    draw();
    sync();
  }

  function position(event: PointerEvent) {
    const rect = host!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function interactive(event: PointerEvent) {
    return event.target instanceof Element && !!event.target.closest(controls);
  }
  function move(event: PointerEvent) {
    const p = position(event);
    if (down && Math.hypot(p.x - down.x, p.y - down.y) > 8) down.moved = true;
    if (event.pointerType === "touch" || reduced || interactive(event)) {
      field.leave();
      return;
    }
    field.move(p.x, p.y);
  }
  function pointerDown(event: PointerEvent) {
    if (reduced || !event.isPrimary || event.button !== 0 || interactive(event))
      return;
    const p = position(event);
    down = { ...p, id: event.pointerId, moved: false };
  }
  function pointerUp(event: PointerEvent) {
    const candidate = down;
    down = null;
    if (
      !candidate ||
      candidate.id !== event.pointerId ||
      candidate.moved ||
      reduced ||
      interactive(event) ||
      !window.getSelection()?.isCollapsed
    )
      return;
    if (
      event.target instanceof Element &&
      event.target.closest("h1, p, pre, code, .hero-promises, .art-caption")
    )
      return;
    const p = position(event);
    if (Math.hypot(p.x - candidate.x, p.y - candidate.y) <= 8)
      field.burst(p.x, p.y);
  }
  function leave() {
    field.leave();
    down = null;
  }
  function updateTheme() {
    target = HERO_FIELD.colors[theme()];
    if (reduced) draw();
  }
  function updateMotion() {
    reduced = motion.matches;
    field.clearInteraction();
    sync();
  }

  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  const size = new ResizeObserver(resize);
  const appearance = new MutationObserver(updateTheme);
  appearance.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  intersection.observe(host);
  size.observe(host);
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerdown", pointerDown, { passive: true });
  host.addEventListener("pointerup", pointerUp, { passive: true });
  host.addEventListener("pointerleave", leave);
  host.addEventListener("pointercancel", leave);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("blur", leave);
  motion.addEventListener("change", updateMotion);
  systemDark.addEventListener("change", updateTheme);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    size.disconnect();
    appearance.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerdown", pointerDown);
    host.removeEventListener("pointerup", pointerUp);
    host.removeEventListener("pointerleave", leave);
    host.removeEventListener("pointercancel", leave);
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("resize", resize);
    window.removeEventListener("blur", leave);
    motion.removeEventListener("change", updateMotion);
    systemDark.removeEventListener("change", updateTheme);
    delete host.dataset.scenePaused;
  };
}
