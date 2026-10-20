"use client";

import { useState, useSyncExternalStore } from "react";
import { Mouse, MouseOff } from "lucide-react";
import {
  readBackgroundMotion,
  setBackgroundMotion,
  subscribeBackgroundMotion,
} from "@/lib/background-motion";

export function AnimationToggle() {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const enabled = useSyncExternalStore(
    subscribeBackgroundMotion,
    readBackgroundMotion,
    () => false,
  );
  const label = enabled ? "Disable mouse effects" : "Enable mouse effects";
  const Icon = enabled ? Mouse : MouseOff;
  return (
    <button
      type="button"
      className="animation-toggle"
      aria-label={label}
      aria-pressed={enabled}
      data-tooltip={label}
      data-tooltip-dismissed={tooltipDismissed}
      onPointerEnter={() => setTooltipDismissed(false)}
      onFocus={() => setTooltipDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setTooltipDismissed(true);
      }}
      onClick={() => setBackgroundMotion(!enabled)}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
