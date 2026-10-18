"use client";

import { useEffect, useId, useRef } from "react";
import { mountSiteBackground } from "@/lib/site-background";

export function SiteBackground() {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => mountSiteBackground(ref.current), []);
  return (
    <svg
      ref={ref}
      className="site-background"
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
          <g data-field-quiet="" />
        </mask>
      </defs>
      <g data-field-layer="" mask={`url(#${id}-mask)`} />
    </svg>
  );
}
