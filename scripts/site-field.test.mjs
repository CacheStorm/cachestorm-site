import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SITE_FIELD,
  SiteField,
  projectY,
  routePoint,
} from "../src/lib/site-field.ts";

function scene(width = 1440, height = 820) {
  const field = new SiteField();
  field.resize(width, height);
  return field;
}
function advance(field, seconds, fps = 60) {
  for (let i = 0; i < seconds * fps; i++) field.step(1 / fps);
}

function stillPackets(distances, width = 1440) {
  const field = scene(width);
  field.routes = [
    {
      points: [
        { x: 0, y: 400 },
        { x: 1440, y: 400 },
      ],
      distances: [0, 1440],
      length: 1440,
      depth: 0.8,
    },
  ];
  field.packets = field.packets.slice(0, distances.length).map((packet, i) => ({
    ...packet,
    route: 0,
    distance: distances[i],
    speed: 0,
  }));
  return field;
}

test("nearby shapes keep orbiting a still pointer and return smoothly", () => {
  const field = stillPackets([700, 1200]);
  field.move(650, 400);
  advance(field, 0.7);
  const packet = field.packets[0];
  let previous = Math.atan2(packet.offset.y, 50 + packet.offset.x);
  let turn = 0;
  for (let i = 0; i < 220; i++) {
    field.step(1 / 60);
    const angle = Math.atan2(packet.offset.y, 50 + packet.offset.x);
    turn += Math.atan2(Math.sin(angle - previous), Math.cos(angle - previous));
    previous = angle;
  }
  assert.ok(
    Math.abs(turn) > 1.8,
    "a still pointer should produce a flowing orbit, not a fixed shove",
  );
  assert.ok(
    Math.hypot(field.packets[1].offset.x, field.packets[1].offset.y) < 0.001,
  );
  const before = { ...packet.offset };
  field.move(1000, 200);
  field.step(1 / 60);
  assert.ok(
    Math.hypot(packet.offset.x - before.x, packet.offset.y - before.y) < 8,
  );
  field.leave();
  advance(field, 4);
  assert.ok(Math.hypot(packet.offset.x, packet.offset.y) < 0.001);
});

test("click waves relay through shapes with finite depth, gain and lifetime", () => {
  const field = stillPackets([530, 615, 700, 1250]);
  field.burst(450, 400);
  const generations = new Set();
  for (let i = 0; i < 240; i++) {
    field.step(1 / 60);
    for (const relay of field.relays ?? []) {
      generations.add(relay.generation);
      assert.ok(relay.gain > 0 && relay.gain < 1);
      assert.ok(relay.generation <= 2);
    }
    assert.ok((field.relays?.length ?? 0) <= 8);
  }
  assert.ok(
    generations.has(1),
    "a wave reaching a shape should emit a local relay",
  );
  assert.ok(
    generations.has(2),
    "a relay should reach a neighboring shape once more",
  );
  assert.equal(field.packets[3].pulse, 0);
  assert.equal(field.relays.length + field.ripples.length, 0);
});

test("relay storms respect mobile and desktop budgets and can be cleared immediately", () => {
  for (const width of [375, 1440]) {
    const field = stillPackets([110, 155, 200, 245], width);
    for (let i = 0; i < 240; i++) {
      if (i % 4 === 0) field.burst(70, 400);
      field.step(1 / 60);
      assert.ok(
        field.relays.length <=
          (field.mobile ? SITE_FIELD.relays.mobileMax : SITE_FIELD.relays.max),
      );
      assert.ok(field.ripples.length <= SITE_FIELD.ripples.max);
      for (const wave of field.waves) {
        assert.ok(
          wave.chain.visited.size <=
            (field.mobile
              ? SITE_FIELD.relays.mobilePerClick
              : SITE_FIELD.relays.perClick),
        );
        assert.ok(
          Math.abs(wave.gain - SITE_FIELD.relays.gain ** wave.generation) <
            0.0001,
        );
      }
      assert.ok(
        field.packets.every(
          (p) =>
            Number.isFinite(p.offset.x) &&
            Number.isFinite(p.offset.y) &&
            Math.abs(p.offset.x) <= SITE_FIELD.maxOffset &&
            Math.abs(p.offset.y) <= SITE_FIELD.maxOffset,
        ),
      );
    }
    field.clearInteraction();
    assert.equal(field.waves.length, 0);
    assert.ok(
      field.packets.every(
        (p) => p.pulse === 0 && p.velocity.x === 0 && p.velocity.y === 0,
      ),
    );
    field.burst(70, 400);
    advance(field, 5);
    assert.equal(field.waves.length, 0);
    assert.ok(field.packets.every((p) => p.pulse < 0.001));
  }
});

test("orbital springs follow the same path at 30, 60 and 144Hz", () => {
  const positions = [30, 60, 144].map((fps) => {
    const field = stillPackets([700]);
    field.move(650, 400);
    advance(field, 4, fps);
    return field.packets[0].offset;
  });
  for (const position of positions.slice(1))
    assert.ok(
      Math.hypot(position.x - positions[0].x, position.y - positions[0].y) <
        1.5,
    );
});

test("pointer flow follows travel direction, ignores entry jumps and settles", () => {
  const field = stillPackets([700, 1200]);
  field.move(600, 400);
  advance(field, 0.5);
  assert.equal(
    field.flow?.x,
    0,
    "entering the viewport must not create a velocity spike",
  );
  for (let i = 1; i <= 30; i++) {
    field.move(600 + i * 2, 400);
    field.step(1 / 60);
  }
  assert.ok(field.flow.x > 100 && field.flow.x < 130);
  assert.equal(field.flow.y, 0);
  assert.ok(
    Math.hypot(field.packets[1].offset.x, field.packets[1].offset.y) < 0.001,
  );
  // Scroll refreshes the same client position and must not add any flow.
  for (let i = 0; i < 180; i++) {
    field.move(660, 400);
    field.step(1 / 60);
  }
  assert.ok(Math.hypot(field.flow.x, field.flow.y) < 0.001);
  field.move(610, 400);
  field.step(1 / 60);
  assert.ok(field.flow.x < 0);
  field.clearInteraction();
  assert.deepEqual(field.flow, { x: 0, y: 0 });
});

test("pointer flow is bounded and independent of event coalescing and refresh rate", () => {
  const velocities = [30, 60, 144].map((fps) => {
    const field = stillPackets([700]);
    field.move(600, 400);
    for (let i = 1; i <= fps; i++) {
      const x = 600 + (i / fps) * 120;
      field.move(x - 0.1, 400);
      field.move(x, 400);
      field.step(1 / fps);
    }
    assert.ok(field.flow.x > 119 && field.flow.x <= 120);
    field.move(100000, 100000);
    field.step(1 / fps);
    assert.ok(Math.hypot(field.flow.x, field.flow.y) <= SITE_FIELD.flowSpeed);
    return field.flow;
  });
  assert.equal(velocities.length, 3);
});

test("packet budgets remain bounded from mobile through 4K", () => {
  for (const width of [375, 768, 1024, 1440, 1920, 2560, 3840]) {
    const field = scene(width);
    assert.ok(field.packets.length >= SITE_FIELD.packets.min);
    assert.ok(
      field.packets.length <=
        (width <= 680 ? SITE_FIELD.packets.mobileMax : SITE_FIELD.packets.max),
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
    assert.equal(field.ripples.length, SITE_FIELD.ripples.max);
    assert.ok(
      field.sparks.length <=
        (field.mobile ? SITE_FIELD.sparks.mobileMax : SITE_FIELD.sparks.max),
    );
    assert.ok(field.trails.length <= SITE_FIELD.trails.max);
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
      Math.hypot(p.x - near.x, p.y - near.y) > SITE_FIELD.pointerRadius + 50
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

test("scroll projection preserves route geometry and recycles beyond the viewport", () => {
  const field = scene();
  for (const route of field.routes) {
    for (const scroll of [0, 400, 5000, 100000]) {
      const first = projectY(route, route.points[0].y, scroll, field.height);
      assert.ok(
        first >= -SITE_FIELD.overscan &&
          first <= field.height + SITE_FIELD.overscan,
      );
      const p = route.points[2];
      assert.ok(
        Math.abs(
          projectY(route, p.y, scroll, field.height) -
            first -
            (p.y - route.points[0].y),
        ) < 0.0001,
      );
    }
  }
});
