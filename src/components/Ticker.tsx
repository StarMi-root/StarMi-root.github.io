import { TICKER_ITEMS } from "../data/articles";

/** 突发新闻跑马灯（固定于导航栏下方） */
export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-[#0e2518] border-b border-gold/25 overflow-hidden">
      <div className="max-w-full flex items-stretch">
        <div className="shrink-0 flex items-center gap-2 bg-coral text-paper font-display tracking-widest text-sm px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-paper blink-dot" />
          突发
        </div>
        <div className="marquee relative flex-1 overflow-hidden py-2" aria-label="滚动新闻">
          <div className="marquee-track flex items-center whitespace-nowrap w-max">
            {items.map((t, i) => (
              <span key={i} className="flex items-center text-[13px] text-mist/85">
                <span className="mx-5 text-gold/70">◆</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
