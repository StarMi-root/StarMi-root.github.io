import { useCallback, useEffect, useState } from "react";
import type { Article, ViewId } from "./data/articles";
import { SEED_ARTICLES } from "./data/articles";
import PondBackground from "./components/PondBackground";
import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import Footer from "./components/Footer";
import { ArticleModal } from "./components/ArticleBits";
import { FrogLogo, IconCheck } from "./components/icons";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import AddPage from "./pages/AddPage";

const LS_KEY = "frognews-articles-v2";

function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Article[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // blob: 视频链接无法跨会话存活，加载时剔除以免出现坏视频
        return parsed.map((a) => (a.video && a.video.kind === "file" ? { ...a, video: undefined } : a));
      }
    }
  } catch {
    /* 数据损坏则回退默认 */
  }
  return SEED_ARTICLES;
}

export default function App() {
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [view, setView] = useState<ViewId>("home");
  const [filter, setFilter] = useState("全部");
  const [articles, setArticles] = useState<Article[]>(loadArticles);
  const [reading, setReading] = useState<Article | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [splash, setSplash] = useState(!reduced);
  const [leaving, setLeaving] = useState(false);

  /* 开场：展示 → 幕布上拉（点击任意处可跳过） */
  useEffect(() => {
    if (!splash) return;
    const t1 = setTimeout(() => setLeaving(true), 1500);
    const t2 = setTimeout(() => setSplash(false), 2250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [splash]);

  const skipSplash = useCallback(() => {
    if (!splash) return;
    setLeaving(true);
    setTimeout(() => setSplash(false), 420);
  }, [splash]);

  /* 持久化文章 */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(articles));
    } catch {
      /* 存储不足时静默降级为会话内有效 */
    }
  }, [articles]);

  /* 切页回顶 */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  /* 通知自动消失 */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const navigate = useCallback((v: ViewId) => setView(v), []);

  const publish = useCallback((a: Article) => {
    setArticles((prev) => [a, ...prev]);
    setView("home");
    setFilter("全部");
    setToast(`《${a.title.length > 14 ? a.title.slice(0, 14) + "…" : a.title}》已发布，登上首页要闻！`);
  }, []);

  return (
    <div className="min-h-screen relative">
      <PondBackground />

      <Navbar view={view} onNavigate={navigate} />
      <Ticker />

      <main className="pt-28">
        {view === "home" && (
          <HomePage
            articles={articles}
            onOpen={setReading}
            onNavigate={navigate}
            filter={filter}
            onFilter={setFilter}
          />
        )}
        {view === "about" && <AboutPage />}
        {view === "add" && <AddPage onPublish={publish} />}
      </main>

      <Footer
        onNavigate={navigate}
        onCategory={(c) => {
          setFilter(c);
          setView("home");
        }}
      />

      <ArticleModal article={reading} onClose={() => setReading(null)} />

      {/* 发布成功通知 */}
      {toast && (
        <div className="fade-up fixed bottom-6 right-4 sm:right-6 z-[95] max-w-sm bg-lily text-ink rounded-md hard-shadow px-5 py-4 flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-ink text-lily flex items-center justify-center shrink-0 mt-0.5">
            <IconCheck className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-[13.5px] font-bold leading-snug">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="mt-1.5 text-[11.5px] font-bold underline underline-offset-2 hover:opacity-70 cursor-pointer"
            >
              好的，呱！
            </button>
          </div>
        </div>
      )}

      {/* 开场动画：蛙 Logo 弹入 + 水波涟漪 + 站名逐字，随后幕布上拉 */}
      {splash && (
        <div
          onClick={skipSplash}
          className="fixed inset-0 z-[100] bg-pond flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={leaving ? { animation: "curtain 0.75s cubic-bezier(0.7, 0, 0.2, 1) forwards" } : undefined}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center">
            <span
              className="absolute w-44 h-44 rounded-full border-2 border-lily/50"
              style={{ animation: "ripple 1.6s ease-out 0.5s infinite" }}
            />
            <span
              className="absolute w-44 h-44 rounded-full border-2 border-gold/40"
              style={{ animation: "ripple 1.6s ease-out 1s infinite" }}
            />
            <FrogLogo className="w-24 h-24 hop-in" />
            <h1 className="mt-6 font-display text-5xl sm:text-6xl text-mist flex gap-1">
              {"蛙蛙新闻网".split("").map((ch, i) => (
                <span key={i} className="fade-up" style={{ animationDelay: `${700 + i * 110}ms` }}>
                  {ch}
                </span>
              ))}
            </h1>
            <p className="mt-4 text-[11px] tracking-[0.5em] text-lily/70 fade-up" style={{ animationDelay: "1000ms" }}>
              呱得准 · 更要呱得真
            </p>
            <p className="absolute bottom-10 text-[11px] tracking-[0.35em] text-mist/35 fade-up" style={{ animationDelay: "1300ms" }}>
              点击任意处跳过 ▸
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
