import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await fs.readFile("src/lib/decorative-motion.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { bindDecorativeMotion } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

function page(t) {
  const originalDocument = globalThis.document;
  const originalObserver = globalThis.IntersectionObserver;
  const engine = { dataset: {} },
    footer = { dataset: {} };
  const listeners = new Map();
  const observers = [];
  globalThis.document = {
    hidden: false,
    querySelectorAll: () => [engine, footer],
    addEventListener: (event, callback) => listeners.set(event, callback),
    removeEventListener: (event, callback) => {
      if (listeners.get(event) === callback) listeners.delete(event);
    },
  };
  globalThis.IntersectionObserver = class {
    observed = new Set();
    disconnected = false;
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(element) {
      this.observed.add(element);
    }
    disconnect() {
      this.disconnected = true;
    }
    enter(target, isIntersecting) {
      this.callback([{ target, isIntersecting }]);
    }
  };
  const cleanup = bindDecorativeMotion();
  t.after(() => {
    cleanup();
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    if (originalObserver === undefined) delete globalThis.IntersectionObserver;
    else globalThis.IntersectionObserver = originalObserver;
  });
  return { engine, footer, listeners, observer: observers[0], cleanup };
}

test("CSS illustrations run only while visible and stop independently", (t) => {
  const p = page(t);
  assert.equal(p.engine.dataset.animationVisible, "false");
  p.observer.enter(p.engine, true);
  assert.equal(p.engine.dataset.animationVisible, "true");
  assert.equal(p.footer.dataset.animationVisible, "false");
  p.observer.enter(p.footer, true);
  p.observer.enter(p.engine, false);
  assert.equal(p.engine.dataset.animationVisible, "false");
  assert.equal(p.footer.dataset.animationVisible, "true");
});

test("hidden tabs pause illustrations and resume only those still on screen", (t) => {
  const p = page(t);
  p.observer.enter(p.engine, true);
  document.hidden = true;
  p.listeners.get("visibilitychange")();
  assert.equal(p.engine.dataset.animationVisible, "false");
  p.observer.enter(p.footer, true);
  assert.equal(p.footer.dataset.animationVisible, "false");
  p.observer.enter(p.engine, false);
  document.hidden = false;
  p.listeners.get("visibilitychange")();
  assert.equal(p.engine.dataset.animationVisible, "false");
  assert.equal(p.footer.dataset.animationVisible, "true");
});

test("route cleanup releases observers, listeners and ignores late deliveries", (t) => {
  const p = page(t);
  p.observer.enter(p.engine, true);
  p.cleanup();
  assert.equal(p.observer.disconnected, true);
  assert.equal(p.listeners.size, 0);
  assert.deepEqual(p.engine.dataset, {});
  p.observer.enter(p.footer, true);
  assert.deepEqual(p.footer.dataset, {});
});
