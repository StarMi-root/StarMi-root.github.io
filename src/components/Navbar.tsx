import { useEffect, useRef, useState } from "react";
import type { ViewId } from "../data/articles";
import { FrogLogo, IconHome, IconInfo, IconQuill, IconChevron } from "./icons";

const MENU: { id: ViewId; label: string; desc: string; Icon: typeof IconHome }[] = [
  { id: "home", label: "首页", desc: "今日头版与要闻", Icon: IconHome },
  { id: "about", label: "报社详情", desc: "十年理想与团队", Icon: IconInfo },
  { id: "add", label: "报道添加", desc: "图文视频全媒投稿", Icon: IconQuill },
];

export default function Navbar({ view, onNavigate }: { view: ViewId; onNavigate: (v: ViewId) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (v: ViewId) => {
    setOpen(false);
    onNavigate(v);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-pond/92 backdrop-blur-md border-b border-lily/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          : "bg-pond/60 backdrop-blur-sm border-b border-lily/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* 左上角 Logo */}
        <button onClick={() => go("home")} className="group flex items-center gap-2.5 cursor-pointer" aria-label="回到首页">
          <FrogLogo className="w-10 h-10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
          <span className="text-left leading-none">
            <span className="font-display text-lg sm:text-xl text-mist block group-hover:text-gold transition-colors">
              蛙蛙新闻网
            </span>
            <span className="text-[9px] tracking-[0.32em] text-lily/60 block mt-1">FROG DAILY</span>
          </span>
        </button>

        {/* 中部导航 md+ */}
        <nav className="hidden md:flex items-center gap-7 mx-auto">
          {MENU.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`nav-link-underline text-[13.5px] font-medium tracking-wide transition-colors cursor-pointer ${
                view === id ? "text-gold active" : "text-mist/70 hover:text-mist"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* 右上角下拉菜单 */}
        <div className="relative ml-auto" ref={wrapRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`flex items-center gap-2 border rounded-md px-3.5 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
              open
                ? "bg-lily/15 border-lily/50 text-lily"
                : "border-lily/25 text-mist/80 hover:border-lily/60 hover:text-lily"
            }`}
          >
            菜单
            <IconChevron className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="pop-in absolute right-0 top-full mt-2.5 w-72 bg-deep border border-lily/25 rounded-md hard-shadow overflow-hidden">
              <p className="px-4 pt-3.5 pb-2 text-[10px] tracking-[0.3em] text-lily/50 border-b border-lily/10">
                蛙蛙新闻网 · 快速导航
              </p>
              {MENU.map(({ id, label, desc, Icon }) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer ${
                    view === id ? "bg-lily/10" : "hover:bg-lily/5"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${
                      view === id ? "border-gold/60 text-gold bg-gold/10" : "border-lily/20 text-lily/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1">
                    <span className={`block text-[14px] font-bold ${view === id ? "text-gold" : "text-mist"}`}>{label}</span>
                    <span className="block text-[11px] text-mist/45 mt-0.5">{desc}</span>
                  </span>
                  {view === id && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                </button>
              ))}
              <p className="px-4 py-2.5 text-[10px] text-mist/30 border-t border-lily/10 bg-pond/50">呱一声 · 新闻即刻送达</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
