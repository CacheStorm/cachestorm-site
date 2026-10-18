import assert from "node:assert/strict";
import { after, test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Compile the real DOM controller with the project's TypeScript compiler.
// Only browser boundaries are faked; drawing, hit filtering and scheduling run.
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "cachestorm-hero-"));
after(() => fs.rm(temp, { recursive: true, force: true }));
for (const name of ["hero-field", "hero-background"]) {
  const source = await fs.readFile(`src/lib/${name}.ts`, "utf8");
  const compiled = ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace('from "./hero-field"', 'from "./hero-field.mjs"');
  await fs.writeFile(path.join(temp, `${name}.mjs`), compiled);
}
const { mountHeroBackground } = await import(
  pathToFileURL(path.join(temp, "hero-background.mjs"))
);

class Target extends EventTarget {
  listeners = new Set();
  dataset = {};
  addEventListener(type, fn, options) {
    this.listeners.add(fn);
    super.addEventListener(type, fn, options);
  }
  removeEventListener(type, fn, options) {
    this.listeners.delete(fn);
    super.removeEventListener(type, fn, options);
  }
  closest(selector) {
    return selector.includes("button") && this.control ? this : null;
  }
}

function browser({ reduced = false, noContext = false, width = 1440 } = {}) {
  const originals = new Map();
  const install = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };
  const host = new Target();
  const doc = new Target();
  const win = new Target();
  const root = new Target();
  const motion = new Target();
  motion.matches = reduced;
  const dark = new Target();
  dark.matches = false;
  const canvas = new Target();
  const raf = new Map();
  const observers = [];
  let serial = 0;
  let now = 100;
  let draws = 0;
  let rings = 0;
  const gradient = { addColorStop() {} };
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "createLinearGradient" || key === "createRadialGradient")
          return () => gradient;
        if (key === "clearRect") return () => draws++;
        if (key === "arc") return () => rings++;
        return () => {};
      },
      set(target, key, value) {
        target[key] = value;
        return true;
      },
    },
  );
  host.getBoundingClientRect = () => ({ left: 0, top: 85, width, height: 820 });
  host.querySelector = () => ({
    getBoundingClientRect: () => ({
      left: 48,
      right: 650,
      top: 160,
      bottom: 800,
    }),
  });
  canvas.closest = () => host;
  canvas.getContext = () => (noContext ? null : ctx);
  doc.hidden = false;
  doc.documentElement = root;
  win.devicePixelRatio = 3;
  win.getSelection = () => ({ isCollapsed: true });
  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      observers.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
  }
  install("document", doc);
  install("window", win);
  install("Element", Target);
  install("matchMedia", (query) => (query.includes("reduced") ? motion : dark));
  install("IntersectionObserver", Observer);
  install("ResizeObserver", Observer);
  install("MutationObserver", Observer);
  install("requestAnimationFrame", (fn) => {
    raf.set(++serial, fn);
    return serial;
  });
  install("cancelAnimationFrame", (id) => raf.delete(id));
  const restore = () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  };
  const flush = (count = 1) => {
    for (let i = 0; i < count; i++) {
      now += 1000 / 60;
      const pending = [...raf.values()];
      raf.clear();
      for (const fn of pending) fn(now);
    }
  };
  const pointer = (
    type,
    { x = 1100, y = 250, kind = "mouse", control = false } = {},
  ) => {
    const target = control ? new Target() : host;
    target.control = control;
    const event = new Event(type, { bubbles: true });
    Object.assign(event, {
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: kind,
      isPrimary: true,
      button: 0,
    });
    if (control) Object.defineProperty(event, "target", { value: target });
    host.dispatchEvent(event);
  };
  return {
    host,
    doc,
    win,
    root,
    motion,
    dark,
    canvas,
    raf,
    observers,
    flush,
    pointer,
    restore,
    get draws() {
      return draws;
    },
    get rings() {
      return rings;
    },
  };
}

test("offscreen, hidden and reduced-motion scenes stop scheduling and resume safely", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountHeroBackground(env.canvas);
    assert.equal(env.raf.size, 0);
    env.observers[0].callback([{ isIntersecting: true }]);
    assert.equal(env.raf.size, 1);
    env.flush(8);
    assert.ok(env.draws > 1);
    env.observers[0].callback([{ isIntersecting: false }]);
    const frozen = env.draws;
    env.flush(120);
    assert.equal(env.draws, frozen);
    assert.equal(env.raf.size, 0);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.flush(4);
    assert.ok(env.draws > frozen);
    env.doc.hidden = true;
    env.doc.dispatchEvent(new Event("visibilitychange"));
    assert.equal(env.raf.size, 0);
    env.doc.hidden = false;
    env.doc.dispatchEvent(new Event("visibilitychange"));
    assert.equal(env.raf.size, 1);
    env.motion.matches = true;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(env.canvas.dataset.motion, "reduced");
    assert.equal(env.raf.size, 0);
    const still = env.draws;
    env.flush(120);
    assert.equal(env.draws, still);
    env.root.dataset.theme = "dark";
    env.observers[2].callback();
    assert.equal(env.draws, still + 1);
    assert.equal(env.raf.size, 0);
    env.motion.matches = false;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(env.raf.size, 1);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("tap creates a wave; controls, dragging and touch scrolling do not", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountHeroBackground(env.canvas);
    env.observers[0].callback([{ isIntersecting: true }]);
    for (const kind of ["mouse", "touch"]) {
      env.pointer("pointerdown", { kind, control: true });
      env.pointer("pointerup", { kind, control: true });
      env.pointer("pointerdown", { kind });
      env.pointer("pointermove", { kind, y: 350 });
      env.pointer("pointerup", { kind, y: 350 });
      env.pointer("pointerdown", { kind });
      env.pointer("pointercancel", { kind });
      env.pointer("pointerup", { kind });
    }
    env.flush(8);
    assert.equal(env.rings, 0);
    env.win.getSelection = () => ({ isCollapsed: false });
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(8);
    assert.equal(env.rings, 0);
    env.win.getSelection = () => ({ isCollapsed: true });
    env.pointer("pointerdown", { kind: "touch" });
    env.pointer("pointerup", { kind: "touch" });
    env.flush(8);
    assert.ok(env.rings > 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("reduced-motion initial load is static and ignores clicks", () => {
  const env = browser({ reduced: true });
  let cleanup;
  try {
    cleanup = mountHeroBackground(env.canvas);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(30);
    assert.ok(env.draws > 0);
    assert.equal(env.rings, 0);
    assert.equal(env.raf.size, 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("DPR is capped and unmount removes every listener, observer and animation", () => {
  const env = browser({ width: 3840 });
  try {
    const cleanup = mountHeroBackground(env.canvas);
    env.observers[0].callback([{ isIntersecting: true }]);
    assert.ok(env.canvas.width * env.canvas.height < 4_010_000);
    assert.ok(env.canvas.width / 3840 <= 1.75);
    cleanup();
    assert.equal(env.raf.size, 0);
    assert.ok(env.observers.every((observer) => observer.disconnected));
    for (const target of [env.host, env.doc, env.win, env.motion, env.dark])
      assert.equal(target.listeners.size, 0);
    assert.equal(env.host.dataset.scenePaused, undefined);
  } finally {
    env.restore();
  }
});

test("missing Canvas 2D leaves the server-rendered hero usable", () => {
  const env = browser({ noContext: true });
  try {
    assert.equal(mountHeroBackground(env.canvas), undefined);
    assert.equal(mountHeroBackground(null), undefined);
    assert.equal(env.raf.size, 0);
    assert.equal(env.observers.length, 0);
    assert.equal(env.host.listeners.size, 0);
  } finally {
    env.restore();
  }
});
