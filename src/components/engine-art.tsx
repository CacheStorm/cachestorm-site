"use client";
import { useId, useState } from "react";
import { StormMark } from "./brand";
const layers = [
  {
    name: "RESP protocol",
    detail: "Your favorite Redis client. A familiar connection.",
    key: "01 / THE CONNECTION",
  },
  {
    name: "256-shard engine",
    detail: "Concurrent access. Data stays in the fast lane.",
    key: "02 / THE ENGINE",
  },
  {
    name: "Durable by choice",
    detail: "AOF and snapshots. Keep the data that matters.",
    key: "03 / PERSISTENCE",
  },
];
export function EngineArt() {
  const [active, setActive] = useState(1);
  const id = useId().replace(/:/g, "");
  return (
    <div className="engine-art">
      <div className="art-status">
        <span className="status-dot" /> ENGINE ONLINE <span>TCP :6380</span>
      </div>
      <svg
        viewBox="0 0 660 540"
        className="engine-svg"
        role="img"
        aria-label="A three-layer CacheStorm engine, connecting Redis clients through RESP to 256 memory shards and persistent storage"
      >
        <defs>
          <pattern
            id={`${id}grid`}
            width="46"
            height="28"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <path
              d="M0 0H46V28"
              fill="none"
              stroke="var(--art-grid)"
              strokeWidth=".65"
            />
          </pattern>
          <linearGradient id={`${id}top`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#6fbcfa" />
            <stop offset="1" stopColor="#1456d4" />
          </linearGradient>
          <linearGradient id={`${id}side`} x1="0" y1="0" x2="1" y2=".5">
            <stop stopColor="#2366e6" />
            <stop offset="1" stopColor="#123e9c" />
          </linearGradient>
          <radialGradient id={`${id}glow`}>
            <stop stopColor="#4f97ff" stopOpacity=".28" />
            <stop offset="1" stopColor="#4f97ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="335" cy="285" rx="285" ry="245" fill={`url(#${id}glow)`} />
        <path
          d="m330 38 310 177v150L330 535 20 358V215Z"
          fill={`url(#${id}grid)`}
          opacity=".55"
        />
        <g
          className="art-traces"
          stroke="var(--art-line)"
          fill="none"
          strokeWidth="1.5"
        >
          <path d="M85 178v118l135 78M574 160v110l-125 72M87 388l102 59 94-54M560 406l-102 59-91-54" />
          <path d="M330 55v72M330 448v58" />
          <path
            d="M85 178v118l135 78M574 160v110l-125 72"
            className="data-stream"
            stroke="#4b91ed"
            strokeWidth="3"
          />
        </g>
        <g className="art-node">
          <path
            d="m40 144 45-26 45 26-45 26Z"
            fill="var(--art-top)"
            stroke="var(--art-line)"
          />
          <path
            d="m40 144 45 26v35l-45-26Zm45 26 45-26v35l-45 26Z"
            fill="var(--art-side)"
            stroke="var(--art-line)"
          />
          <text
            x="85"
            y="150"
            textAnchor="middle"
            fill="var(--art-ink)"
            fontSize="17"
            fontFamily="monospace"
          >
            &lt;/&gt;
          </text>
          <text x="87" y="228" textAnchor="middle" className="art-label">
            YOUR APPLICATION
          </text>
        </g>
        <g className="art-node">
          <path
            d="m529 126 45-26 45 26-45 26Z"
            fill="var(--art-top)"
            stroke="var(--art-line)"
          />
          <path
            d="m529 126 45 26v35l-45-26Zm45 26 45-26v35l-45 26Z"
            fill="var(--art-side)"
            stroke="var(--art-line)"
          />
          <text
            x="574"
            y="134"
            textAnchor="middle"
            fill="var(--art-ink)"
            fontSize="16"
            fontFamily="monospace"
          >
            RESP
          </text>
          <text x="574" y="210" textAnchor="middle" className="art-label">
            ANY REDIS CLIENT
          </text>
        </g>
        <g
          className="art-layer art-layer-bottom"
          opacity={active === 2 ? 1 : 0.86}
        >
          <path
            d="m158 365 172-99 172 99-172 99Z"
            fill="var(--art-top)"
            stroke="var(--art-line)"
            strokeWidth="1.5"
          />
          <path
            d="m158 365 172 99v25l-172-99Zm172 99 172-99v25l-172 99Z"
            fill="var(--art-side)"
            stroke="var(--art-line)"
          />
          <path
            d="m190 365 140-81 140 81-140 81Z"
            fill="none"
            stroke="var(--art-line)"
          />
          <text x="330" y="442" textAnchor="middle" className="art-label">
            AOF + SNAPSHOTS
          </text>
        </g>
        <g className="art-layer art-layer-middle">
          <path d="m158 278 172-99 172 99-172 99Z" fill={`url(#${id}top)`} />
          <path
            d="m158 278 172 99v38l-172-99Zm172 99 172-99v38l-172 99Z"
            fill={`url(#${id}side)`}
          />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} stroke="#b4dcff" strokeWidth=".6" opacity=".35">
              <path d={`M${180 + i * 22} ${291 + i * 12.7}l145-84`} />
              <path d={`M${180 + i * 22} ${265 - i * 12.7}l145 84`} />
            </g>
          ))}
          <text
            x="330"
            y="353"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="600"
            letterSpacing="3"
          >
            256 SHARDS
          </text>
          <circle
            cx="476"
            cy="316"
            r="3"
            fill="#99facd"
            className="pulse-dot"
          />
        </g>
        <g className="art-layer art-layer-top">
          <path
            d="m158 183 172-99 172 99-172 99Z"
            fill="var(--art-top)"
            stroke="var(--art-line)"
            strokeWidth="1.5"
          />
          <path
            d="m158 183 172 99v27l-172-99Zm172 99 172-99v27l-172 99Z"
            fill="var(--art-side)"
            stroke="var(--art-line)"
          />
          <path
            d="m181 183 149-86 149 86-149 86Z"
            fill="none"
            stroke="var(--art-line)"
          />
          <g transform="translate(282 114) scale(.92 .82)">
            <StormMark width="100" height="120" />
          </g>
          <text
            x="330"
            y="243"
            textAnchor="middle"
            className="art-label"
            fill="var(--art-ink)"
          >
            CACHESTORM ENGINE
          </text>
        </g>
        <circle cx="85" cy="296" r="3" fill="#4293e7" />
        <circle cx="574" cy="270" r="3" fill="#4293e7" />
        <g transform="translate(24 420)">
          <rect
            width="132"
            height="29"
            rx="14.5"
            fill="var(--surface)"
            stroke="var(--line)"
          />
          <circle cx="15" cy="14" r="3" fill="#24a878" />
          <text x="28" y="18" className="art-label">
            PURE GO · NO CGO
          </text>
        </g>
        <g transform="translate(492 359)">
          <rect
            width="140"
            height="29"
            rx="14.5"
            fill="var(--surface)"
            stroke="var(--line)"
          />
          <text x="14" y="18" className="art-label">
            ONE BINARY. ALL IN.
          </text>
        </g>
      </svg>
      <div className="art-caption">
        <span>{layers[active].key}</span>
        <span>{layers[active].name}</span>
      </div>
      <div className="art-layer-controls" aria-label="Explore engine layers">
        {layers.map((layer, index) => (
          <button
            type="button"
            aria-pressed={index === active}
            key={layer.key}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            {layer.name}
          </button>
        ))}
      </div>
      <p className="art-detail" aria-live="polite">
        {layers[active].detail}
      </p>
    </div>
  );
}
