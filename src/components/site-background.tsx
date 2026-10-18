"use client";

import { useEffect, useId, useRef } from "react";
import { bindSiteBackground } from "@/lib/site-background";

export function SiteBackground() {
  const ref = useRef<SVGSVGElement>(null);
  const interaction = useRef<SVGSVGElement>(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => bindSiteBackground(ref.current, interaction.current), []);
  return (
    <>
      <svg
        ref={ref}
        className="site-background"
        data-enabled="false"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="white" stopOpacity="0" />
            <stop offset=".09" stopColor="white" />
            <stop offset=".91" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask
            id={`${id}-mask`}
            maskUnits="userSpaceOnUse"
            style={{ maskType: "luminance" }}
          >
            <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
        <g data-field-layer="" mask={`url(#${id}-mask)`} />
      </svg>
      <svg
        ref={interaction}
        className="site-interaction"
        data-enabled="false"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor="var(--field-active)" stopOpacity="0" />
            <stop
              offset=".35"
              stopColor="var(--field-active)"
              stopOpacity=".065"
            />
            <stop
              offset=".7"
              stopColor="var(--field-active)"
              stopOpacity=".03"
            />
            <stop offset="1" stopColor="var(--field-active)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g data-field-interactive="" data-glow={`url(#${id}-glow)`} />
      </svg>
    </>
  );
}
