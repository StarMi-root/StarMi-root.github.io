import { useEffect, useState } from "react";

/** 新站正式开站时刻：2026-09-05 08:40 */
export const SITE_START = new Date(2026, 8, 5, 8, 40, 0).getTime();

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 距开站时刻的实时时长（每秒跳动） */
export function useLiveElapsed(startMs: number = SITE_START) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, now - startMs);
  return {
    days: Math.floor(diff / 86400000),
    hh: pad2(Math.floor((diff % 86400000) / 3600000)),
    mm: pad2(Math.floor((diff % 3600000) / 60000)),
    ss: pad2(Math.floor((diff % 60000) / 1000)),
  };
}
