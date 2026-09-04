import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base: P = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconClose(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
export function IconChevron(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
export function IconHome(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}
export function IconInfo(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  );
}
export function IconQuill(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 4c-6.5.5-12 5-13.5 12.5L4 20l3.5-1.5C15 16.5 19.5 10.5 20 4Z" />
      <path d="m4 20 9-9" />
    </svg>
  );
}
export function IconClock(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
export function IconEye(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconFilm(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" />
    </svg>
  );
}
export function IconImage(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 15.5-4.5-4.5L7 20.5" />
    </svg>
  );
}
export function IconUpload(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 16V4" />
      <path d="m6 10 6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  );
}
export function IconTrash(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="m6 7 1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
export function IconCheck(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
export function IconFeather(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 4c-6.5.5-12 5-13.5 12.5L4 20l3.5-1.5C15 16.5 19.5 10.5 20 4Z" />
      <path d="m4 20 9-9" />
      <path d="M20 4c-3 5-6 8-11 10.5" />
    </svg>
  );
}
export function IconPin(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
export function IconMail(p: P) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7.5 9 6 9-6" />
    </svg>
  );
}
export function IconWave(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M2 10c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0" />
      <path d="M2 16c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0" opacity="0.5" />
    </svg>
  );
}
export function IconArrow(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* ================= 蛙 Logo ================= */
export function FrogLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="19" cy="16" r="9" fill="#5CB338" stroke="#12291A" strokeWidth="2.5" />
      <circle cx="45" cy="16" r="9" fill="#5CB338" stroke="#12291A" strokeWidth="2.5" />
      <path
        d="M32 12 C46 12 57 22 57 35 C57 47 46 55 32 55 C18 55 7 47 7 35 C7 22 18 12 32 12 Z"
        fill="#5CB338"
        stroke="#12291A"
        strokeWidth="2.5"
      />
      <circle cx="19" cy="15" r="4.6" fill="#EEF0DD" stroke="#12291A" strokeWidth="1.6" />
      <circle cx="45" cy="15" r="4.6" fill="#EEF0DD" stroke="#12291A" strokeWidth="1.6" />
      <circle cx="20" cy="15.5" r="2.1" fill="#12291A" />
      <circle cx="46" cy="15.5" r="2.1" fill="#12291A" />
      <circle cx="20.9" cy="14.6" r="0.7" fill="#fff" />
      <circle cx="46.9" cy="14.6" r="0.7" fill="#fff" />
      <circle cx="13" cy="37" r="3.4" fill="#F5C842" opacity="0.85" />
      <circle cx="51" cy="37" r="3.4" fill="#F5C842" opacity="0.85" />
      <circle cx="28.5" cy="30" r="1.2" fill="#12291A" />
      <circle cx="35.5" cy="30" r="1.2" fill="#12291A" />
      <path d="M21 38 Q32 47 43 38" fill="none" stroke="#12291A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ================= 蛙头像（团队） ================= */
export type FrogAccessory = "glasses" | "hat" | "mic" | "scarf" | "headset";
const SKINS = ["#5CB338", "#6FBE4A", "#4EA83B", "#7CC957", "#57B048", "#65B843"];

export function FrogAvatar({
  index = 0,
  accessory,
  className = "",
}: {
  index?: number;
  accessory?: FrogAccessory;
  className?: string;
}) {
  const skin = SKINS[index % SKINS.length];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="19" cy="16" r="9" fill={skin} stroke="#12291A" strokeWidth="2.2" />
      <circle cx="45" cy="16" r="9" fill={skin} stroke="#12291A" strokeWidth="2.2" />
      <path
        d="M32 12 C46 12 57 22 57 35 C57 47 46 55 32 55 C18 55 7 47 7 35 C7 22 18 12 32 12 Z"
        fill={skin}
        stroke="#12291A"
        strokeWidth="2.2"
      />
      <circle cx="19" cy="15" r="4.4" fill="#EEF0DD" stroke="#12291A" strokeWidth="1.4" />
      <circle cx="45" cy="15" r="4.4" fill="#EEF0DD" stroke="#12291A" strokeWidth="1.4" />
      <circle cx="20" cy="15.5" r="2" fill="#12291A" />
      <circle cx="46" cy="15.5" r="2" fill="#12291A" />
      <circle cx="13" cy="37" r="3.2" fill="#F5C842" opacity="0.85" />
      <circle cx="51" cy="37" r="3.2" fill="#F5C842" opacity="0.85" />
      <path d="M22 39 Q32 46.5 42 39" fill="none" stroke="#12291A" strokeWidth="2.2" strokeLinecap="round" />
      {accessory === "glasses" && (
        <g stroke="#12291A" strokeWidth="1.8" fill="none">
          <circle cx="19" cy="15" r="6" />
          <circle cx="45" cy="15" r="6" />
          <path d="M25 15h14" />
        </g>
      )}
      {accessory === "hat" && (
        <g>
          <path d="M15 9 Q32 -3 49 9 L45 12 Q32 4 19 12 Z" fill="#F5C842" stroke="#12291A" strokeWidth="1.6" />
        </g>
      )}
      {accessory === "mic" && (
        <g>
          <rect x="44" y="38" width="8" height="12" rx="4" fill="#EEF0DD" stroke="#12291A" strokeWidth="1.6" />
          <path d="M48 50v6M44 56h8" stroke="#12291A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>
      )}
      {accessory === "scarf" && (
        <path d="M10 44 Q32 54 54 44 L54 50 Q32 60 10 50 Z" fill="#FF6B4A" stroke="#12291A" strokeWidth="1.8" />
      )}
      {accessory === "headset" && (
        <g>
          <path d="M8 22 Q8 4 32 4 Q56 4 56 22" fill="none" stroke="#12291A" strokeWidth="2.4" />
          <rect x="4" y="18" width="7" height="12" rx="3" fill="#F5C842" stroke="#12291A" strokeWidth="1.6" />
          <rect x="53" y="18" width="7" height="12" rx="3" fill="#F5C842" stroke="#12291A" strokeWidth="1.6" />
          <path d="M56 30 Q58 38 48 40" fill="none" stroke="#12291A" strokeWidth="1.8" />
        </g>
      )}
    </svg>
  );
}
