import { useMemo } from "react";
import type { Article, ViewId } from "../data/articles";
import { CATEGORIES, formatRead, todayCN, issueNo } from "../data/articles";
import { ArticleCard, ArticleCover, CategoryTag } from "../components/ArticleBits";
import { Reveal, useCountUp } from "../components/Reveal";
import { useLiveElapsed } from "../components/LiveElapsed";
import { IconClock, IconEye, IconArrow, IconFeather } from "../components/icons";

const TAKES = [
  {
    author: "蛙长老",
    role: "总编辑",
    tag: "编者的话",
    quote: "雨下得再大，也浇不灭头版的墨香。今天我们把编辑部搬到了水下——新闻，照样呱呱坠地。",
    rotate: "-rotate-1",
  },
  {
    author: "蛙算盘",
    role: "财经主编",
    tag: "舌尖观察",
    quote: "虫子会涨，蚊子会跌，但蛙民对早餐的热情永远看多。今晚加餐，就当代替读者做了调研。",
    rotate: "rotate-1",
  },
  {
    author: "蛙小唱",
    role: "文化记者",
    tag: "文娱手记",
    quote: "一张荷叶票被炒到三串露珠，说明我们的夜晚终于值钱了。艺术无价，但蟋蟀有出场费。",
    rotate: "-rotate-1",
  },
];

const BOARD = [
  { value: 1, suffix: "份", label: "今日发行" },
  { value: 8402, suffix: "蛙", label: "在线读者" },
  { value: 214, suffix: "篇", label: "今日来稿" },
  { value: 98, suffix: "%", label: "塘域覆盖率" },
];

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: v } = useCountUp(value, 1500);
  return (
    <div className="text-center">
      <span ref={ref} className="font-display text-3xl sm:text-5xl text-gold tabular-nums leading-none inline-block">
        {v}
      </span>
      <span className="font-display text-lg sm:text-2xl text-gold/70 ml-1">{suffix}</span>
      <p className="mt-2 text-[11px] tracking-[0.25em] text-mist/50">{label}</p>
    </div>
  );
}

/** 风雨无阻 · 自 2026.09.05 08:40 起的实时计时 */
function LiveStat() {
  const { days, hh, mm, ss } = useLiveElapsed();
  return (
    <div className="text-center">
      <span className="inline-flex items-baseline justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-coral blink-dot self-center shrink-0" aria-hidden="true" />
        <span className="font-display text-3xl sm:text-5xl text-gold tabular-nums leading-none">{days}</span>
        <span className="font-display text-lg sm:text-2xl text-gold/70">天</span>
      </span>
      <span className="block font-display text-lg sm:text-2xl text-gold tabular-nums tracking-[0.15em] mt-1">
        {hh}:{mm}:{ss}
      </span>
      <p className="mt-2 text-[11px] tracking-[0.25em] text-mist/50">风雨无阻 · 实时</p>
    </div>
  );
}

export default function HomePage({
  articles,
  onOpen,
  onNavigate,
  filter,
  onFilter,
}: {
  articles: Article[];
  onOpen: (a: Article) => void;
  onNavigate: (v: ViewId) => void;
  filter: string;
  onFilter: (c: string) => void;
}) {
  /** 新站实时运行时长（徽章用） */
  const { days, hh, mm, ss } = useLiveElapsed();

  /** 头版头条固定取官方要闻第一篇；用户投稿进要闻区置顶 */
  const headline = useMemo(() => articles.find((a) => !a.userAdded) ?? articles[0], [articles]);
  const rest = useMemo(() => articles.filter((a) => a.id !== headline?.id), [articles, headline]);
  const filtered = useMemo(() => (filter === "全部" ? rest : rest.filter((a) => a.category === filter)), [rest, filter]);
  const headlineMatches = filter === "全部" || headline?.category === filter;

  const countOf = (c: string) => (c === "全部" ? articles.length : articles.filter((a) => a.category === c).length);

  return (
    <div className="page-in">
      {/* ============ 头版刊头 ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-mist/50 border-b border-lily/15 pb-4">
          <span className="text-gold font-bold tracking-widest">第 {issueNo()} 期</span>
          <span>{todayCN()}</span>
          <span className="hidden sm:inline text-mist/35">总第 {issueNo()} 期 · 晨间版</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lily blink-dot" />
            今夜多云转流星雨 · 适宜晾晒翅膀
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 mt-8 lg:mt-12 items-end">
          <div className="lg:col-span-7 relative">
            <h1 className="font-display leading-[0.95] text-mist">
              <span className="line-mask">
                <span className="text-[clamp(66px,11vw,132px)]" style={{ ["--ld" as string]: "80ms" }}>
                  蛙蛙
                </span>
              </span>
              <span className="line-mask">
                <span className="text-[clamp(38px,6vw,72px)] text-lily" style={{ ["--ld" as string]: "240ms" }}>
                  新 闻 网
                </span>
              </span>
            </h1>

            {/* 新站运行实时纪念章 */}
            <div
              className="stamp-in absolute -top-2 right-0 sm:right-6 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-coral/80 text-coral hidden md:flex flex-col items-center justify-center gap-0.5 bg-coral/5"
              style={{ animationDelay: "700ms", opacity: 0 }}
            >
              <span className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-coral blink-dot" aria-hidden="true" />
                新站运行
              </span>
              <span className="font-display text-2xl sm:text-[26px] leading-none mt-1">{days} 天</span>
              <span className="text-[12px] sm:text-[13px] tabular-nums tracking-wider text-gold">
                {hh}:{mm}:{ss}
              </span>
              <span className="text-[8px] tracking-[0.18em] text-coral/70 mt-1">自 2026.09.05 08:40</span>
            </div>

            <p className="fade-up mt-6 max-w-xl text-[15px] leading-relaxed text-mist/65" style={{ animationDelay: "480ms" }}>
              呱得准，更要呱得真 —— 全塘发行量最大的两栖类日报。从荷叶议会到蚊虫期货，
              三百六十五个荷塘的大事小情，每天清晨六点，带露水送达。
            </p>

            <div className="fade-up mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-lily/15 pt-7" style={{ animationDelay: "620ms" }}>
              <Stat value={20120602} suffix="份" label="累计发行" />
              <Stat value={7} suffix="只" label="在职记者" />
              <Stat value={365} suffix="个" label="覆盖荷塘" />
              <LiveStat />
            </div>
          </div>

          {/* 头版头条卡 */}
          {headline && headlineMatches && (
            <div className="lg:col-span-5 fade-up" style={{ animationDelay: "380ms" }}>
              <article
                onClick={() => onOpen(headline)}
                className="group cursor-pointer bg-deep border-2 border-gold/40 rounded-md overflow-hidden card-lift"
              >
                <div className="relative">
                  <div className="overflow-hidden">
                    <ArticleCover article={headline} className="aspect-[16/10]" imgClass="kenburns" />
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-display text-[12px] tracking-[0.25em] bg-coral text-paper px-2.5 py-1 rounded-sm">
                      头版头条
                    </span>
                    <CategoryTag category={headline.category} />
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <h2 className="font-display text-2xl sm:text-[27px] leading-snug text-mist group-hover:text-gold transition-colors duration-300">
                    {headline.title}
                  </h2>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-mist/55 line-clamp-2">{headline.lede}</p>
                  <div className="mt-4 pt-3 border-t border-lily/10 flex items-center gap-3 text-[11px] text-mist/45">
                    <span className="text-lily/80 font-medium">{headline.author}</span>
                    <span className="flex items-center gap-1">
                      <IconClock className="w-3.5 h-3.5" /> {headline.time}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <IconEye className="w-3.5 h-3.5" /> {formatRead(headline.readCount)}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>
      </section>

      {/* ============ 要闻区 ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20">
        <Reveal className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-lily/70 font-medium">HEADLINES</p>
            <h2 className="font-display text-3xl sm:text-4xl text-mist mt-1.5">今日要闻</h2>
          </div>
          <p className="text-xs text-mist/45 hidden sm:block">点击卡片阅读全文 ↗</p>
        </Reveal>

        <Reveal className="flex flex-wrap gap-2 mb-8" delay={80}>
          {["全部", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => onFilter(c)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200 cursor-pointer ${
                filter === c
                  ? "bg-gold text-ink border-gold -translate-y-0.5 hard-shadow-sm"
                  : "border-lily/25 text-mist/65 hover:border-lily/60 hover:text-lily"
              }`}
            >
              {c}
              <span className={`ml-1.5 text-[10.5px] ${filter === c ? "text-ink/60" : "text-mist/35"}`}>{countOf(c)}</span>
            </button>
          ))}
        </Reveal>

        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 90}>
                <ArticleCard article={a} onOpen={onOpen} index={i} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="border-2 border-dashed border-lily/25 rounded-md py-16 text-center">
              <p className="font-display text-2xl text-mist/70">「{filter}」栏目还没有报道</p>
              <p className="text-sm text-mist/45 mt-2">第一声呱，由你来发</p>
              <button
                onClick={() => onNavigate("add")}
                className="mt-6 inline-flex items-center gap-2 bg-gold text-ink font-bold text-sm px-6 py-3 rounded-md hard-shadow-gold hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <IconFeather className="w-4 h-4" /> 去发布第一篇
              </button>
            </div>
          </Reveal>
        )}
      </section>

      {/* ============ 主编快评 ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal className="mb-10">
          <p className="text-[11px] tracking-[0.35em] text-lily/70 font-medium">EDITOR'S NOTES</p>
          <h2 className="font-display text-3xl sm:text-4xl text-mist mt-1.5">主编快评</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-7">
          {TAKES.map((t, i) => (
            <Reveal key={t.author} delay={i * 110}>
              <div
                className={`relative bg-paper text-ink rounded-sm px-6 pt-8 pb-6 hard-shadow ${t.rotate} hover:rotate-0 hover:-translate-y-1.5 transition-transform duration-300`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gold/75 rotate-2 shadow-sm" aria-hidden="true" />
                <p className="text-[10px] font-bold tracking-[0.3em] text-ink/45">{t.tag}</p>
                <p className="mt-3 text-[15px] leading-relaxed font-medium text-ink/85">「{t.quote}」</p>
                <div className="mt-5 pt-4 border-t border-ink/15 flex items-center justify-between">
                  <span className="font-display text-lg text-ink">
                    {t.author} <span className="text-[11px] text-ink/50 font-body">· {t.role}</span>
                  </span>
                  <span className="font-display text-ink/25 text-xl">呱</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 数据看板 ============ */}
      <section className="mt-20 sm:mt-24">
        <Reveal>
          <div className="bg-deep border-y-2 border-lily/20 py-10 sm:py-12 grid grid-cols-2 lg:grid-cols-4 gap-y-10 divide-x divide-lily/10">
            {BOARD.map((b) => (
              <Stat key={b.label} {...b} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ 投稿 CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-md border-2 border-gold/50 bg-fern px-6 sm:px-12 py-12 flex flex-col lg:flex-row items-start lg:items-center gap-8 hard-shadow-gold">
            <span
              className="absolute -right-6 -bottom-10 font-display text-[200px] leading-none text-outline pointer-events-none select-none"
              aria-hidden="true"
            >
              呱
            </span>
            <div className="relative flex-1">
              <p className="text-[11px] tracking-[0.35em] text-gold/80 font-medium">CALL FOR NEWS</p>
              <h2 className="font-display text-3xl sm:text-5xl text-mist mt-2">
                塘里有大事？<span className="text-gold">呱一声。</span>
              </h2>
              <p className="mt-3 text-mist/70 max-w-xl text-[14.5px] leading-relaxed">
                支持文字、图片、视频全媒体投稿。发布后即刻登上首页要闻区，三百六十五个荷塘的读者都在看。
              </p>
            </div>
            <button
              onClick={() => onNavigate("add")}
              className="relative group flex items-center gap-2.5 bg-gold text-ink font-bold text-[15px] px-8 py-4 rounded-md hard-shadow hover:-translate-y-0.5 hover:bg-[#ffd75e] active:translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <IconFeather className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
              去发布报道
              <IconArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
