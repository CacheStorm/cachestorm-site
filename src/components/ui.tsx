"use client";
import { Check, Copy, AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
function Highlight({ code }: { code: string }) {
  const parts = code.split(
    /(^\s*(?:#|\/\/)[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|const|await|try|finally|package|func|defer|if|return|true|false|nil|SET|GET|PING|PONG|EX|HSET|HGETALL|ZADD|XADD|TAGKEYS|INVALIDATE|TTL)\b|\b\d+\b)/gm,
  );
  return parts.map((part, i) => {
    const kind = /^\s*(#|\/\/)/.test(part)
      ? "comment"
      : /^["']/.test(part)
        ? "string"
        : /^\d+$/.test(part)
          ? "number"
          : /^(import|from|const|await|try|finally|package|func|defer|if|return|true|false|nil|SET|GET|PING|PONG|EX|HSET|HGETALL|ZADD|XADD|TAGKEYS|INVALIDATE|TTL)$/.test(
                part,
              )
            ? "keyword"
            : "plain";
    return (
      <span className={`syntax-${kind}`} key={i}>
        {part}
      </span>
    );
  });
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0.5, 1], y: [18, 0] }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function CopyButton({
  text,
  label = "Copy code",
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("done");
    } catch {
      setStatus("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }
  return (
    <button
      type="button"
      className={`copy-button ${status}`}
      onClick={copy}
      aria-label={
        status === "done"
          ? "Copied"
          : status === "error"
            ? "Copy failed. Select the code manually."
            : label
      }
      title={status === "error" ? "Select and copy the code manually" : label}
    >
      {status === "done" ? (
        <Check />
      ) : status === "error" ? (
        <AlertCircle />
      ) : (
        <Copy />
      )}
      <span className="sr-only" role="status">
        {status === "done"
          ? "Copied to clipboard"
          : status === "error"
            ? "Copy failed. Select and copy the code manually."
            : ""}
      </span>
    </button>
  );
}
export function CodeBlock({
  code,
  title = "terminal",
  language = "shell",
}: {
  code: string;
  title?: string;
  language?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>{title}</span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0}>
        <code className={`language-${language}`}>
          <Highlight code={code} />
        </code>
      </pre>
    </div>
  );
}
