/** 全局氛围背景：深潭渐变 + 漂浮荷叶 + 萤火 + 噪点 */
export default function PondBackground() {
  const pads = [
    { top: "12%", left: "6%", size: 210, dur: 13, delay: 0, opacity: 0.5 },
    { top: "68%", left: "88%", size: 260, dur: 16, delay: 1.2, opacity: 0.45 },
    { top: "82%", left: "8%", size: 170, dur: 12, delay: 0.6, opacity: 0.4 },
    { top: "34%", left: "90%", size: 140, dur: 15, delay: 2, opacity: 0.35 },
    { top: "52%", left: "44%", size: 320, dur: 19, delay: 0.3, opacity: 0.22 },
  ];
  const flies = [
    { top: "22%", left: "18%", delay: 0 },
    { top: "30%", left: "72%", delay: 1.4 },
    { top: "58%", left: "12%", delay: 2.2 },
    { top: "70%", left: "64%", delay: 0.8 },
    { top: "44%", left: "84%", delay: 3 },
    { top: "86%", left: "36%", delay: 1.8 },
    { top: "16%", left: "52%", delay: 2.6 },
  ];
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 78% -10%, #1d4a2e 0%, transparent 55%), radial-gradient(900px 600px at -10% 40%, #16382a 0%, transparent 50%), radial-gradient(1000px 800px at 50% 115%, #143321 0%, transparent 55%), linear-gradient(180deg, #0b1f15 0%, #0d2417 50%, #0b1f15 100%)",
        }}
      />
      {pads.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 100 100"
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `${i % 2 === 0 ? "drift" : "driftAlt"} ${p.dur}s ease-in-out ${p.delay}s infinite`,
            filter: "blur(1px)",
          }}
        >
          <path
            d="M50 6 A44 44 0 1 0 50 94 A44 44 0 1 0 50 6 Z M50 50 L96 38"
            fill="#1d4a2e"
            fillRule="evenodd"
            stroke="#2e7d4f"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <path d="M50 50 L20 22 M50 50 L14 62 M50 50 L52 94 M50 50 L80 76" stroke="#2e7d4f" strokeOpacity="0.4" strokeWidth="1" />
        </svg>
      ))}
      {flies.map((f, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: f.top,
            left: f.left,
            width: 5,
            height: 5,
            background: "#F5C842",
            boxShadow: "0 0 12px 3px rgba(245,200,66,0.55)",
            animation: `firefly ${5 + (i % 3)}s ease-in-out ${f.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 noise-layer" />
    </div>
  );
}
