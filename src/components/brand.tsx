import type { SVGProps } from "react";
import { useId } from "react";
export function StormMark(props: SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 120" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient
          id={`${id}blue`}
          x1="12"
          y1="15"
          x2="72"
          y2="109"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#72d6f4" />
          <stop offset=".48" stopColor="#248ac5" />
          <stop offset="1" stopColor="#105181" />
        </linearGradient>
        <linearGradient
          id={`${id}silver`}
          x1="40"
          y1="17"
          x2="91"
          y2="107"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d6e1e8" />
          <stop offset="1" stopColor="#718895" />
        </linearGradient>
      </defs>
      <path
        d="M48 8C36 6 26 20 11 28C5 31 5 38 7 49L7 87C7 95 17 99 29 106L36 91C18 81 13 66 17 49C20 33 31 21 47 19Z"
        fill={`url(#${id}blue)`}
        stroke="#24607e"
        strokeWidth="2.5"
      />
      <path
        d="M42 15C29 22 19 33 17 48C12 70 21 84 32 91M10 39C10 64 16 83 29 94"
        stroke="#a7e4f5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m69 17 23 16-20 10-7-13ZM72 78l21 11c-5 17-22 27-43 28l8-16c13-2 20-9 21-16"
        fill={`url(#${id}silver)`}
        stroke="#788b97"
        strokeWidth="2.5"
      />
      <path
        d="m72 23 13 10-12 6M62 108c12-4 20-10 24-17"
        stroke="#eef5f8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="37" r="2.5" fill="#b9edff" />
      <circle cx="43" cy="15" r="2.5" fill="#b9edff" />
      <circle cx="15" cy="89" r="2.5" fill="#b9edff" />
      <circle cx="77" cy="30" r="2.5" fill="#f2f7fa" />
      <circle cx="65" cy="107" r="2.5" fill="#f2f7fa" />
      <path
        d="M66 3 27 65h22l-19 52 45-66H54L66 3Z"
        fill={`url(#${id}blue)`}
        stroke="#143f5c"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M61 16 37 61h20l-16 39 25-45H49L61 16Z"
        fill="#89d8ed"
        opacity=".72"
      />
    </svg>
  );
}
export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span className={`logo ${large ? "logo-large" : ""}`}>
      <StormMark />
      <span>
        CacheStorm<span className="logo-dot">.</span>
      </span>
    </span>
  );
}
export function OxogMark() {
  return (
    <svg
      viewBox="0 0 200 130"
      fill="none"
      aria-hidden="true"
      className="oxog-mark"
    >
      <path
        d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
        stroke="#ed0878"
        strokeWidth="12"
      />
      <path
        d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
        stroke="#ed0878"
        strokeWidth="12"
      />
      <path
        d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
        stroke="var(--oxog-purple)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="m74 87 54-51"
        stroke="#ed0878"
        strokeWidth="12"
        strokeLinecap="square"
      />
    </svg>
  );
}
