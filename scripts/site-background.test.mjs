import assert from "node:assert/strict";
import { after, test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Run the real SVG controller; only browser boundaries are faked.
const tempRoot = path.resolve(os.tmpdir());
const temp = await fs.mkdtemp(path.join(tempRoot, "cachestorm-svg-"));
after(() => {
  if (
    path.dirname(path.resolve(temp)) !== tempRoot ||
    !path.basename(temp).startsWith("cachestorm-svg-")
  )
    throw new Error("Unsafe test cleanup path");
  return fs.rm(temp, { recursive: true, force: true });
});
for (const name of ["site-field", "background-motion", "site-background"]) {
  const source = await fs.readFile(`src/lib/${name}.ts`, "utf8");
  const compiled = ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace('from "./site-field"', 'from "./site-field.mjs"')
    .replace('from "./background-motion"', 'from "./background-motion.mjs"');
  await fs.writeFile(path.join(temp, `${name}.mjs`), compiled);
}
const { mountSiteBackground, bindSiteBackground } = await import(
  pathToFileURL(path.join(temp, "site-background.mjs"))
);
const {
  BACKGROUND_MOTION_KEY,
  readBackgroundMotion,
  setBackgroundMotion,
  subscribeBackgroundMotion,
} = await import(pathToFileURL(path.join(temp, "background-motion.mjs")));

class Target extends EventTarget {
  listeners = new Set();
  dataset = {};
  attributes = new Map();
  children = [];
  writes = 0;
  addEventListener(type, fn, options) {
    this.listeners.add(fn);
    super.addEventListener(type, fn, options);
  }
  removeEventListener(type, fn, options) {
    this.listeners.delete(fn);
    super.removeEventListener(type, fn, options);
  }
  closest(selector) {
    return (selector.includes("button") && this.control) ||
      (selector.includes("h1") && this.text)
      ? this
      : null;
  }
  setAttribute(key, value) {
    this.attributes.set(key, value);
    this.writes++;
  }
  getAttribute(key) {
    return this.attributes.get(key) ?? null;
  }
  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  replaceChildren() {
    this.children = [];
  }
}
const descendants = (node) => [node, ...node.children.flatMap(descendants)];

function browser({ reduced = false, missingLayer = false, width = 1440 } = {}) {
  const originals = new Map();
  const install = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };
  const doc = new Target(),
    win = new Target(),
    root = new Target(),
    motion = new Target(),
    svg = new Target(),
    layer = new Target(),
    interactive = new Target(),
    interaction = new Target(),
    main = new Target();
  const raf = new Map(),
    observers = [];
  const storage = new Map();
  let serial = 0,
    now = 100,
    currentWidth = width;
  motion.matches = reduced;
  win.matchMedia = () => motion;
  win.localStorage = {
    getItem(key) {
      if (win.storageBlocked) throw new Error("Storage unavailable");
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      if (win.storageBlocked) throw new Error("Storage unavailable");
      storage.set(key, value);
    },
  };
  svg.querySelector = (selector) =>
    missingLayer ? null : selector.includes("data-field-layer") ? layer : null;
  interaction.querySelector = () => (missingLayer ? null : interactive);
  svg.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: currentWidth,
    height: 900,
  });
  doc.querySelector = () => main;
  doc.querySelectorAll = () => [
    {
      getBoundingClientRect: () => ({
        left: 48,
        right: 650,
        top: 160 - win.scrollY,
        bottom: 800 - win.scrollY,
        width: 602,
        height: 640,
      }),
    },
  ];
  doc.createElementNS = () => new Target();
  doc.hidden = false;
  doc.documentElement = root;
  win.scrollY = 0;
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
  install("matchMedia", () => motion);
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
    { x = 1100, y = 250, kind = "mouse", control = false, text = false } = {},
  ) => {
    const target = new Target();
    target.control = control;
    target.text = text;
    const event = new Event(type, { bubbles: true });
    Object.assign(event, {
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: kind,
      isPrimary: true,
      button: 0,
    });
    Object.defineProperty(event, "target", { value: target });
    doc.dispatchEvent(event);
  };
  return {
    doc,
    win,
    root,
    motion,
    svg,
    layer,
    interactive,
    interaction,
    raf,
    observers,
    storage,
    flush,
    pointer,
    restore,
    resize(next) {
      currentWidth = next;
      win.dispatchEvent(new Event("resize"));
    },
    get writes() {
      return [...descendants(layer), ...descendants(interactive)].reduce(
        (sum, node) => sum + node.writes,
        0,
      );
    },
    get rendered() {
      return [...descendants(layer), ...descendants(interactive)];
    },
    get rings() {
      return descendants(interactive).filter(
        (node) =>
          node.getAttribute("class") === "field-ripple" &&
          Number(node.getAttribute("opacity")) > 0,
      ).length;
    },
  };
}

test("mouse toggle clears input effects while ambient animation keeps running without remounting", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = bindSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.pointer("pointermove");
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(8);
    assert.ok(env.rings > 0);
    assert.equal(env.raf.size, 1);
    setBackgroundMotion(false);
    assert.equal(env.storage.get(BACKGROUND_MOTION_KEY), "off");
    assert.equal(env.svg.dataset.enabled, "true");
    assert.equal(env.interaction.dataset.enabled, "false");
    assert.equal(env.raf.size, 1);
    assert.ok(env.layer.children.length > 0);
    assert.equal(env.rings, 0);
    assert.equal(
      env.doc.listeners.size,
      1,
      "only the ambient visibility listener stays attached",
    );
    assert.ok(env.observers.every((o) => !o.disconnected));
    const before = env.writes;
    env.pointer("pointermove");
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.win.dispatchEvent(new Event("scroll"));
    env.flush(120);
    assert.ok(env.writes > before, "ambient shapes must continue moving");
    assert.equal(env.rings, 0, "disabled clicks must not create waves");
    assert.ok(
      env.rendered
        .filter((n) => n.getAttribute("class") === "field-trail")
        .every((n) => Number(n.getAttribute("opacity")) === 0),
    );
    setBackgroundMotion(true);
    assert.equal(env.storage.get(BACKGROUND_MOTION_KEY), "on");
    env.pointer("pointermove");
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(8);
    assert.equal(env.svg.dataset.enabled, "true");
    assert.equal(env.raf.size, 1);
    assert.ok(env.rings > 0, "input effects restart immediately");
    setBackgroundMotion(true);
    assert.equal(
      env.observers.length,
      2,
      "mouse preferences must never remount the ambient scene",
    );
    cleanup();
    cleanup = null;
    assert.equal(env.raf.size, 0);
    for (const target of [env.doc, env.win, env.motion])
      assert.equal(target.listeners.size, 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("mouse choices synchronize across tabs while ambient motion always respects reduced motion", () => {
  const env = browser({ reduced: true });
  let cleanup;
  try {
    cleanup = bindSiteBackground(env.svg, env.interaction);
    assert.equal(readBackgroundMotion(), false);
    assert.equal(env.observers.length, 2);
    env.observers[0].callback([{ isIntersecting: true }]);
    assert.equal(env.doc.listeners.size, 1);
    assert.equal(env.raf.size, 0);
    env.motion.matches = false;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(env.svg.dataset.enabled, "true");
    setBackgroundMotion(false);
    assert.equal(readBackgroundMotion(), false);
    assert.equal(env.svg.dataset.enabled, "true");
    assert.equal(env.interaction.dataset.enabled, "false");
    env.motion.matches = true;
    env.motion.dispatchEvent(new Event("change"));
    setBackgroundMotion(true);
    env.flush(8);
    assert.equal(
      env.svg.dataset.motion,
      "reduced",
      "mouse preferences must not override the system's ambient motion limit",
    );
    env.storage.set(BACKGROUND_MOTION_KEY, "off");
    env.win.dispatchEvent(
      Object.assign(new Event("storage"), { key: BACKGROUND_MOTION_KEY }),
    );
    assert.equal(env.interaction.dataset.enabled, "false");
    env.storage.clear();
    env.win.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
    assert.equal(readBackgroundMotion(), false);
    env.motion.matches = false;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(readBackgroundMotion(), true);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("a saved off choice stays off on mount and storage failures still allow this tab to toggle", () => {
  const env = browser();
  let cleanup, unsubscribe;
  try {
    env.storage.set(BACKGROUND_MOTION_KEY, "off");
    cleanup = bindSiteBackground(env.svg, env.interaction);
    assert.equal(env.observers.length, 2);
    env.observers[0].callback([{ isIntersecting: true }]);
    assert.equal(env.svg.dataset.enabled, "true");
    assert.equal(env.interaction.dataset.enabled, "false");
    let updates = 0;
    unsubscribe = subscribeBackgroundMotion(() => updates++);
    env.win.storageBlocked = true;
    setBackgroundMotion(true);
    assert.equal(readBackgroundMotion(), true);
    assert.equal(env.interaction.dataset.enabled, "true");
    setBackgroundMotion(false);
    assert.equal(readBackgroundMotion(), false);
    assert.equal(env.raf.size, 1);
    assert.equal(updates, 2);
  } finally {
    cleanup?.();
    unsubscribe?.();
    env.win.storageBlocked = false;
    setBackgroundMotion(false);
    env.restore();
  }
});

test("pointer traces continue over controls while control clicks stay excluded", () => {
  const env = browser();
  let cleanup;
  const traces = () =>
    env.rendered.filter(
      (node) =>
        node.getAttribute("class") === "field-trail" &&
        Number(node.getAttribute("opacity")) > 0,
    );
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.pointer("pointermove", { x: 700, y: 400 });
    env.flush(8);
    assert.ok(
      traces().length > 0,
      "ordinary content still produces pointer traces",
    );
    env.flush(120);
    env.pointer("pointermove", { control: true });
    env.flush(8);
    assert.ok(
      traces().length > 0,
      "moving over controls must keep pointer traces alive",
    );
    env.pointer("pointerdown", { control: true });
    env.pointer("pointerup", { control: true });
    env.flush(8);
    assert.equal(env.rings, 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("offscreen, hidden and reduced-motion backgrounds stop scheduling and resume", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    assert.equal(env.raf.size, 0);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.flush(8);
    assert.equal(env.raf.size, 1);
    env.observers[0].callback([{ isIntersecting: false }]);
    const frozen = env.writes;
    env.flush(120);
    assert.equal(env.writes, frozen);
    assert.equal(env.raf.size, 0);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.flush(8);
    assert.ok(env.writes > frozen);
    env.doc.hidden = true;
    env.doc.dispatchEvent(new Event("visibilitychange"));
    assert.equal(env.raf.size, 0);
    env.doc.hidden = false;
    env.doc.dispatchEvent(new Event("visibilitychange"));
    assert.equal(env.raf.size, 1);
    env.motion.matches = true;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(env.svg.dataset.motion, "reduced");
    assert.equal(env.raf.size, 0);
    const still = env.writes;
    env.flush(120);
    assert.equal(env.writes, still);
    env.motion.matches = false;
    env.motion.dispatchEvent(new Event("change"));
    assert.equal(env.raf.size, 1);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("tap emits an SVG wave; control clicks, selection and touch scrolling do not", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    for (const kind of ["mouse", "touch"]) {
      for (const option of [{ control: true }]) {
        env.pointer("pointerdown", { kind, ...option });
        env.pointer("pointerup", { kind, ...option });
      }
      env.pointer("pointerdown", { kind });
      env.pointer("pointermove", { kind, y: 350 });
      env.pointer("pointerup", { kind, y: 350 });
      env.pointer("pointerdown", { kind });
      env.pointer("pointercancel", { kind });
      env.pointer("pointerup", { kind });
    }
    env.flush(8);
    assert.equal(env.rings, 0);
    env.pointer("pointerdown", { kind: "touch" });
    env.win.scrollY = 1;
    env.win.dispatchEvent(new Event("scroll"));
    env.pointer("pointerup", { kind: "touch" });
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
    env.flush(180);
    assert.equal(env.rings, 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("reduced-motion initial load is static and ignores interactions", () => {
  const env = browser({ reduced: true });
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    const before = env.writes;
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(30);
    assert.equal(env.writes, before);
    assert.equal(env.rings, 0);
    assert.equal(env.raf.size, 0);
    env.root.dataset.theme = "dark";
    env.flush(30);
    assert.equal(env.raf.size, 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("SVG pools stay bounded under resize and a click storm, and clean up on unmount", () => {
  const env = browser({ width: 3840 });
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    const count = env.rendered.length;
    for (let i = 0; i < 200; i++) {
      env.pointer("pointerdown");
      env.pointer("pointerup");
    }
    env.flush(8);
    assert.equal(env.rendered.length, count);
    assert.ok(count < 400);
    for (const width of [375, 1024, 3840, 375]) {
      env.resize(width);
      assert.ok(env.rendered.length < 400);
    }
    cleanup();
    cleanup = null;
    assert.equal(env.raf.size, 0);
    assert.ok(env.observers.every((observer) => observer.disconnected));
    for (const target of [env.doc, env.win, env.motion])
      assert.equal(target.listeners.size, 0);
    assert.equal(
      env.layer.children.length + env.interactive.children.length,
      0,
    );
    env.resize(1024);
    // A queued observer callback after unmount must not resurrect SVG nodes.
    env.observers[0].callback([{ isIntersecting: true }]);
    env.observers[1].callback();
    env.flush(8);
    assert.equal(
      env.layer.children.length + env.interactive.children.length,
      0,
    );
    assert.equal(env.raf.size, 0);
    assert.equal(env.svg.dataset.motion, undefined);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("pointer light stays at client coordinates while scrolling across content", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.pointer("pointermove", { x: 700, y: 400, text: true });
    env.flush(20);
    const focus = env.rendered.find(
      (node) => node.getAttribute("class") === "field-focus",
    );
    assert.equal(focus.getAttribute("transform"), "translate(700.00 400.00)");
    env.win.scrollY = 4000;
    env.win.dispatchEvent(new Event("scroll"));
    env.flush(20);
    assert.equal(focus.getAttribute("transform"), "translate(700.00 400.00)");
    assert.ok(Number(focus.getAttribute("opacity")) > 0.8);
    env.pointer("pointerdown", { x: 700, y: 400, text: true });
    env.pointer("pointerup", { x: 700, y: 400, text: true });
    env.flush(8);
    const wave = env.rendered.find(
      (node) =>
        node.getAttribute("class") === "field-ripple" &&
        Number(node.getAttribute("opacity")) > 0,
    );
    assert.equal(wave.getAttribute("transform"), "translate(700.00 400.00)");
    assert.equal(env.raf.size, 1);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("all interactive visuals use the unmasked foreground and expire naturally", () => {
  const env = browser();
  let cleanup;
  try {
    cleanup = mountSiteBackground(env.svg, env.interaction);
    env.observers[0].callback([{ isIntersecting: true }]);
    env.pointer("pointermove");
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.flush(12);
    const front = descendants(env.interactive);
    assert.ok(
      front.some(
        (node) =>
          node.getAttribute("class") === "field-ripple" &&
          Number(node.getAttribute("opacity")) > 0,
      ),
    );
    for (const item of front) assert.equal(item.getAttribute("mask"), null);
    assert.ok(
      descendants(env.layer).every(
        (node) =>
          !["field-effects", "field-links", "field-focus"].includes(
            node.getAttribute("class"),
          ),
      ),
    );
    env.pointer("pointerleave");
    env.flush(240);
    assert.equal(env.rings, 0);
    const focus = front.find(
      (node) => node.getAttribute("class") === "field-focus",
    );
    assert.equal(Number(focus.getAttribute("opacity")), 0);
  } finally {
    cleanup?.();
    env.restore();
  }
});

test("missing SVG slots leave the server-rendered page usable", () => {
  const env = browser({ missingLayer: true });
  try {
    assert.equal(mountSiteBackground(env.svg, env.interaction), undefined);
    assert.equal(mountSiteBackground(null), undefined);
    assert.equal(env.raf.size, 0);
    assert.equal(env.observers.length, 0);
  } finally {
    env.restore();
  }
});
