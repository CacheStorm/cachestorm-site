import assert from "node:assert/strict";
import { test } from "node:test";
import { HERO_FIELD, HeroField, routePoint } from "../src/lib/hero-field.ts";

function scene(width = 1440, height = 820) {
  const field = new HeroField();
  field.resize(width, height);
  return field;
}
function advance(field, seconds, fps = 60) {
  for (let i = 0; i < seconds * fps; i++) field.step(1 / fps);
}

test("packet budgets remain bounded from mobile through 4K", () => {
  for (const width of [375, 768, 1024, 1440, 1920, 2560, 3840]) {
    const field = scene(width);
    assert.ok(field.packets.length >= HERO_FIELD.packets.min);
    assert.ok(
      field.packets.length <=
        (width <= 680 ? HERO_FIELD.packets.mobileMax : HERO_FIELD.packets.max),
    );
    assert.ok(
      field.routes.every(
        (route) => route.points[0].x < 0 && route.points.at(-1).x > width,
      ),
    );
  }
});

test("a click storm stays bounded and every transient expires", () => {
  for (const width of [375, 1440]) {
    const field = scene(width);
    for (let i = 0; i < 500; i++) {
      field.burst(200, 200);
      field.move(100 + (i % 200), 200);
    }
    assert.equal(field.ripples.length, HERO_FIELD.ripples.max);
    assert.ok(
      field.sparks.length <=
        (field.mobile ? HERO_FIELD.sparks.mobileMax : HERO_FIELD.sparks.max),
    );
    assert.ok(field.trails.length <= HERO_FIELD.trails.max);
    assert.ok(
      field.ripples.every(
        (ripple) => ripple.variant >= 0 && ripple.variant <= 2,
      ),
    );
    advance(field, 3);
    assert.equal(
      field.ripples.length + field.sparks.length + field.trails.length,
      0,
    );
    assert.ok(
      field.packets.every((packet) => Number.isFinite(packet.distance)),
    );
  }
});

test("motion uses elapsed time consistently at 30, 60 and 144Hz", () => {
  const positions = [30, 60, 144].map((fps) => {
    const field = scene();
    advance(field, 4, fps);
    return field.packets.map((packet) => packet.distance);
  });
  for (let i = 0; i < positions[0].length; i++) {
    assert.ok(Math.abs(positions[0][i] - positions[1][i]) < 0.001);
    assert.ok(Math.abs(positions[0][i] - positions[2][i]) < 0.001);
  }
});

test("large time gaps cannot jump the scene forward", () => {
  const field = scene();
  const control = scene();
  field.step(90);
  control.step(0.05);
  assert.deepEqual(field.packets, control.packets);
  assert.equal(field.time, 0.05);
});

test("pointer force stays local and settles after leaving", () => {
  const field = scene();
  const near = routePoint(
    field.routes[field.packets[8].route],
    field.packets[8].distance,
  );
  field.move(near.x + 15, near.y + 10);
  advance(field, 0.3);
  assert.ok(
    field.packets.some(
      (packet) => Math.hypot(packet.offset.x, packet.offset.y) > 0.5,
    ),
  );
  const far = field.packets.filter((packet) => {
    const p = routePoint(field.routes[packet.route], packet.distance);
    return (
      Math.hypot(p.x - near.x, p.y - near.y) > HERO_FIELD.pointerRadius + 50
    );
  });
  assert.ok(far.length > 0);
  assert.ok(
    far.every((packet) => Math.hypot(packet.offset.x, packet.offset.y) < 0.01),
  );
  field.leave();
  advance(field, 4);
  assert.ok(field.pointer.strength < 0.0001);
  assert.ok(
    field.packets.every(
      (packet) => Math.hypot(packet.offset.x, packet.offset.y) < 0.001,
    ),
  );
});

test("idle scene settles and can wake up again without accumulating objects", () => {
  const field = scene();
  field.move(700, 300);
  advance(field, 1);
  assert.ok(field.intensity > 0.9);
  advance(field, 8);
  assert.ok(field.intensity < 0.001);
  assert.ok(field.pointer.strength < 0.001);
  field.move(800, 400);
  advance(field, 1);
  assert.ok(field.intensity > 0.9);
  field.clearInteraction();
  assert.equal(field.pointer.strength, 0);
  assert.equal(
    field.ripples.length + field.sparks.length + field.trails.length,
    0,
  );
});

test("out-of-bounds taps do not create effects", () => {
  const field = scene();
  for (const [x, y] of [
    [-1, 200],
    [1441, 200],
    [200, -1],
    [200, 821],
  ])
    field.burst(x, y);
  assert.equal(field.ripples.length + field.sparks.length, 0);
});
