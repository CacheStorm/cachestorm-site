// All distances are CSS pixels and all durations are seconds.
export const SITE_FIELD = {
  mobileWidth: 680,
  areaPerPacket: 34_000,
  packets: { min: 12, max: 64, mobileMax: 16 },
  lanes: { min: 7, max: 16, mobileMax: 8 },
  fps: { active: 60, idle: 24, mobile: 30 },
  speed: 16,
  parallax: 0.07,
  overscan: 90,
  symbolScale: 3.8,
  quietRegions: 16,
  idleAfter: 5,
  pointerRadius: 170,
  displacement: 30,
  edgeFade: 64,
  ripples: { max: 6, life: 1.8, radius: 235, mobileRadius: 145 },
  sparks: { max: 60, mobileMax: 24, perClick: 10, life: 1.1 },
  trails: { max: 12, life: 0.65, spacing: 22 },
} as const;

export type Point = { x: number; y: number };
export type Route = {
  points: Point[];
  distances: number[];
  length: number;
  depth: number;
};
type Packet = {
  route: number;
  distance: number;
  speed: number;
  size: number;
  offset: Point;
};
type Ripple = Point & { age: number; variant: number; life: number };
type Spark = Point & { vx: number; vy: number; age: number; life: number };
type Trail = Point & { age: number; life: number };

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const easeOut = (n: number) => 1 - (1 - clamp(n)) ** 3;

export function routePoint(route: Route, distance: number) {
  const along = ((distance % route.length) + route.length) % route.length;
  let i = 1;
  while (i < route.distances.length - 1 && route.distances[i] < along) i++;
  const a = route.points[i - 1];
  const b = route.points[i];
  const segment = route.distances[i] - route.distances[i - 1];
  const t = (along - route.distances[i - 1]) / segment;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  };
}

// Wrap an entire route outside the viewport, so recycling never shows a seam.
export function projectY(
  route: Route,
  y: number,
  scroll: number,
  height: number,
) {
  const span = height + SITE_FIELD.overscan * 2;
  const anchor = route.points[0].y;
  const shifted = anchor - scroll * route.depth * SITE_FIELD.parallax;
  return (
    y +
    (((((shifted + SITE_FIELD.overscan) % span) + span) % span) -
      SITE_FIELD.overscan) -
    anchor
  );
}

export class SiteField {
  width = 0;
  height = 0;
  mobile = false;
  time = 0;
  intensity = 0;
  scroll = 0;
  scrollTarget = 0;
  pointer = { x: -1000, y: -1000, inside: false, strength: 0 };
  routes: Route[] = [];
  packets: Packet[] = [];
  ripples: Ripple[] = [];
  sparks: Spark[] = [];
  trails: Trail[] = [];
  private lastInteraction = -100;
  private lastClick = -100;
  private clickSequence = 0;
  private lastTrail: Point = { x: -1000, y: -1000 };

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.mobile = width <= SITE_FIELD.mobileWidth;
    let seed = 6380;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const lanes = Math.round(
      clamp(
        height / 65,
        SITE_FIELD.lanes.min,
        this.mobile ? SITE_FIELD.lanes.mobileMax : SITE_FIELD.lanes.max,
      ),
    );
    this.routes = Array.from({ length: lanes }, (_, lane) => {
      const y = ((lane + 0.5) / lanes) * height;
      const bend = (random() > 0.5 ? 1 : -1) * (30 + random() * 36);
      const shift = random() * width * 0.1;
      const points = [
        { x: -100, y },
        { x: width * 0.14 + shift, y },
        { x: width * 0.14 + shift + Math.abs(bend), y: y + bend },
        { x: width * 0.51 + shift, y: y + bend },
        { x: width * 0.51 + shift + Math.abs(bend), y },
        { x: width + 100, y },
      ];
      const distances = [0];
      for (let i = 1; i < points.length; i++) {
        distances.push(
          distances[i - 1] +
            Math.hypot(
              points[i].x - points[i - 1].x,
              points[i].y - points[i - 1].y,
            ),
        );
      }
      return {
        points,
        distances,
        length: distances.at(-1)!,
        depth: 0.4 + random() * 0.6,
      };
    });
    const count = Math.round(
      clamp(
        (width * height) / SITE_FIELD.areaPerPacket,
        SITE_FIELD.packets.min,
        this.mobile ? SITE_FIELD.packets.mobileMax : SITE_FIELD.packets.max,
      ),
    );
    this.packets = Array.from({ length: count }, (_, i) => {
      const route = i % lanes;
      return {
        route,
        distance: random() * this.routes[route].length,
        speed: SITE_FIELD.speed * (0.6 + random() * 1.1),
        size: 2 + random() * 2.6,
        offset: { x: 0, y: 0 },
      };
    });
    this.clearInteraction();
  }

  move(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.inside = true;
    this.lastInteraction = this.time;
    if (
      Math.hypot(x - this.lastTrail.x, y - this.lastTrail.y) >=
      SITE_FIELD.trails.spacing
    ) {
      this.trails.push({ x, y, age: 0, life: SITE_FIELD.trails.life });
      this.trails = this.trails.slice(-SITE_FIELD.trails.max);
      this.lastTrail = { x, y };
    }
  }

  leave() {
    this.pointer.inside = false;
    this.lastTrail = { x: -1000, y: -1000 };
  }

  burst(x: number, y: number) {
    if (x < 0 || y < 0 || x > this.width || y > this.height) return;
    const rapid = this.time - this.lastClick < 0.4;
    const variant = rapid ? 2 : this.clickSequence++ % 2;
    this.lastClick = this.time;
    this.lastInteraction = this.time;
    this.ripples.push({ x, y, age: 0, life: SITE_FIELD.ripples.life, variant });
    this.ripples = this.ripples.slice(-SITE_FIELD.ripples.max);
    const count = this.mobile ? 6 : SITE_FIELD.sparks.perClick;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + variant * 0.3;
      const speed = 40 + (i % 3) * 24;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: SITE_FIELD.sparks.life,
      });
    }
    this.sparks = this.sparks.slice(
      -(this.mobile ? SITE_FIELD.sparks.mobileMax : SITE_FIELD.sparks.max),
    );
  }

  clearInteraction() {
    this.ripples = [];
    this.sparks = [];
    this.trails = [];
    this.pointer.inside = false;
    this.pointer.strength = 0;
    this.intensity = 0;
    this.lastInteraction = -100;
    this.lastClick = -100;
    this.lastTrail = { x: -1000, y: -1000 };
    for (const packet of this.packets) packet.offset = { x: 0, y: 0 };
  }

  step(elapsed: number) {
    // A suspended tab or a dropped frame must never advance an entire scene.
    const dt = clamp(elapsed, 0, 0.05);
    this.time += dt;
    const awake = this.time - this.lastInteraction < SITE_FIELD.idleAfter;
    const mix = 1 - Math.exp(-dt * 5);
    this.scroll += (this.scrollTarget - this.scroll) * mix;
    this.intensity += ((awake ? 1 : 0) - this.intensity) * mix;
    this.pointer.strength +=
      ((this.pointer.inside && awake ? 1 : 0) - this.pointer.strength) * mix;
    for (const packet of this.packets) {
      const route = this.routes[packet.route];
      packet.distance =
        (packet.distance + packet.speed * dt * (0.55 + this.intensity * 0.45)) %
        route.length;
      const p = routePoint(route, packet.distance);
      const dx = p.x - this.pointer.x;
      const screenY = projectY(route, p.y, this.scroll, this.height);
      const dy = screenY - this.pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence =
        clamp(1 - distance / SITE_FIELD.pointerRadius) ** 2 *
        this.pointer.strength;
      let ox =
        (dx / Math.max(1, distance)) * influence * SITE_FIELD.displacement;
      let oy =
        (dy / Math.max(1, distance)) * influence * SITE_FIELD.displacement;
      for (const ripple of this.ripples) {
        const radius = easeOut(ripple.age / ripple.life) * this.rippleRadius;
        const rx = p.x - ripple.x;
        const ry = screenY - ripple.y;
        const rd = Math.hypot(rx, ry);
        const force =
          clamp(1 - Math.abs(rd - radius) / 38) *
          (1 - ripple.age / ripple.life) *
          14;
        ox += (rx / Math.max(1, rd)) * force;
        oy += (ry / Math.max(1, rd)) * force;
      }
      packet.offset.x += (clamp(ox, -40, 40) - packet.offset.x) * mix;
      packet.offset.y += (clamp(oy, -40, 40) - packet.offset.y) * mix;
    }
    this.ripples = this.ripples.filter((r) => (r.age += dt) < r.life);
    this.trails = this.trails.filter((r) => (r.age += dt) < r.life);
    const drag = Math.exp(-dt * 2.8);
    this.sparks = this.sparks.filter((s) => {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= drag;
      s.vy *= drag;
      return s.age < s.life;
    });
  }

  get rippleRadius() {
    return this.mobile
      ? SITE_FIELD.ripples.mobileRadius
      : SITE_FIELD.ripples.radius;
  }
}
