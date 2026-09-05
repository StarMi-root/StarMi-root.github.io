import { Reveal, useCountUp } from "../components/Reveal";
import { useLiveElapsed } from "../components/LiveElapsed";
import { FrogAvatar, type FrogAccessory } from "../components/icons";
import { SafeImg } from "../components/ArticleBits";
import { IMG } from "../data/articles";

const TIMELINE = [
  {
    time: "07:20",
    date: "2026.09.04",
    title: "荷叶创刊",
    desc: "露珠还没干，4 只蛙在一片巴掌大的荷叶上印出第一份报纸，头版只印了 3 份，头条是《雨停了，虫子多了》。",
  },
  {
    time: "09:50",
    date: "2026.09.04",
    title: "蛙蛙社成立",
    desc: "编辑部在中央荷叶上正式挂牌，定下社训「呱得准，更要呱得真」，首批记者 4 只，信物是一片带露水的荷叶。",
  },
  {
    time: "10:45",
    date: "2026.09.04",
    title: "全媒体矩阵",
    desc: "上线视频新闻与水声广播，首次实现「看得见的蛙鸣」；投稿通道同步开放，支持图文视频全媒体发稿。",
  },
  {
    time: "08:40",
    date: "2026.09.05",
    title: "新官网上线",
    desc: "就是你现在看到的这个。官网正式开站，每一片荷叶都是一个头条——页面上的计时器，就是从这一刻开始跳动的。",
  },
];

const TEAM: { name: string; role: string; quote: string; accessory: FrogAccessory }[] = [
  { name: "蛙长老", role: "总编辑", quote: "蹲得深，才呱得真。", accessory: "glasses" },
  { name: "蛙大嘴", role: "首席记者", quote: "没有我撬不开的蚌。", accessory: "hat" },
  { name: "蛙小跳", role: "摄影记者", quote: "跳得高，看得远。", accessory: "mic" },
  { name: "蛙算盘", role: "财经主编", quote: "每只虫子都要算清楚。", accessory: "glasses" },
  { name: "蛙飞毛", role: "体育记者", quote: "追新闻和追蜻蜓一样快。", accessory: "scarf" },
  { name: "蛙呱呱", role: "气象主播", quote: "今晚的月亮，适合晾晒翅膀。", accessory: "headset" },
];

const VALUES = [
  { no: "01", title: "真实如蛙鸣", desc: "每一声呱都有据可查。我们不生产新闻，我们只是荷塘的扩音器。" },
  { no: "02", title: "速度赛蝌蚪", desc: "从线索到见报，最快纪录是 47 秒——那是一条关于雨的新闻，因为雨正好落下来作证。" },
  { no: "03", title: "深度比塘深", desc: "头版只有一片荷叶，但调查可以潜到塘底三米。浅水出不了好新闻。" },
];

function BigStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: v } = useCountUp(value, 1600);
  return (
    <div className="text-center px-4">
      <span ref={ref} className="font-display text-4xl sm:text-6xl text-gold tabular-nums leading-none inline-block">
        {v}
      </span>
      <span className="font-display text-xl sm:text-2xl text-gold/70 ml-1">{suffix}</span>
      <p className="mt-2 text-xs sm:text-[13px] text-mist/55 tracking-widest">{label}</p>
    </div>
  );
}

/** 自 2026-09-05 08:40 起的实时运行时长（风雨无阻计时） */
function LiveStat() {
  const { days, hh, mm, ss } = useLiveElapsed();
  return (
    <div className="text-center px-2">
      <span className="inline-flex items-baseline justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral blink-dot self-center shrink-0" aria-hidden="true" />
        <span className="font-display text-4xl sm:text-6xl text-gold tabular-nums leading-none">{days}</span>
        <span className="font-display text-xl sm:text-2xl text-gold/70">天</span>
        <span className="font-display text-2xl sm:text-4xl text-gold tabular-nums leading-none tracking-wider">
          {hh}:{mm}:{ss}
        </span>
      </span>
      <p className="mt-2 text-xs sm:text-[13px] text-mist/55 tracking-widest">风雨无阻 · 自 2026.09.05 08:40</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-in max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
      {/* 页首 */}
      <section className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <p className="fade-up text-[11px] tracking-[0.35em] text-lily/70 font-medium" style={{ animationDelay: "60ms" }}>
            ABOUT · 报社详情
          </p>
          <h1 className="font-display mt-4 text-4xl sm:text-6xl leading-[1.15] text-mist">
            <span className="line-mask">
              <span style={{ ["--ld" as string]: "140ms" }}>一张荷叶撑起的</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--ld" as string]: "300ms" }} className="text-gold">
                新闻理想
              </span>
            </span>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-[15px] leading-relaxed text-mist/65" style={{ animationDelay: "420ms" }}>
            蛙蛙新闻网创立于 2026 年 9 月 4 日清晨，社址位于青蛙塘中央睡莲大厦三层。作为塘域最具影响力的两栖类媒体，
            我们坚持「呱得准，更要呱得真」，每天清晨六点准时开编会，为三百六十五个荷塘的读者送去带着露水的一手新闻。
          </p>
          <p className="fade-up mt-4 max-w-xl text-[15px] leading-relaxed text-mist/65" style={{ animationDelay: "520ms" }}>
            创刊以来，我们的记者去过最深的塘底、最高的芦苇梢，也被骤雨冲走过一次——报纸从未停刊。
          </p>
          <div className="fade-up mt-7 flex flex-wrap gap-3 text-[11px] text-mist/55" style={{ animationDelay: "620ms" }}>
            {["两栖类一级新闻资质", "荷塘新闻奖 · 九连冠", "清水会环保伙伴"].map((t) => (
              <span key={t} className="border border-lily/25 rounded-full px-3.5 py-1.5 hover:border-gold/60 hover:text-gold transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 fade-up" style={{ animationDelay: "300ms" }}>
          <div className="relative rounded-md overflow-hidden border-2 border-lily/30 hard-shadow">
            <div className="overflow-hidden">
              <SafeImg src={IMG.newsroom} alt="蛙蛙新闻网编辑部" char="社" className="w-full aspect-[4/3.4] object-cover kenburns" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-pond/90 to-transparent px-4 pb-3.5 pt-10">
              <p className="text-[11px] text-mist/70">◈ 清晨 05:50 的编辑部，开编会前的最后校对</p>
            </div>
          </div>
        </div>
      </section>

      {/* 数字看板 */}
      <section className="mt-16 sm:mt-20">
        <Reveal>
          <div className="bg-deep border-y-2 border-lily/20 py-10 sm:py-12 grid grid-cols-2 lg:grid-cols-5 gap-y-10 divide-x divide-lily/10">
            <BigStat value={20120602} suffix="份" label="累计发行" />
            <BigStat value={3} suffix="份" label="今日发行" />
            <BigStat value={128} suffix="只" label="在职记者" />
            <BigStat value={365} suffix="个" label="覆盖荷塘" />
            <LiveStat />
          </div>
        </Reveal>
      </section>

      {/* 编年史 */}
      <section className="mt-16 sm:mt-24">
        <Reveal className="mb-10">
          <p className="text-[11px] tracking-[0.35em] text-lily/70 font-medium">CHRONICLE</p>
          <h2 className="font-display text-3xl sm:text-4xl text-mist mt-2">蛙蛙编年史</h2>
        </Reveal>
        <div className="relative ml-3 sm:ml-6 border-l-2 border-lily/25 pl-8 sm:pl-12 space-y-12">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.date + t.time} delay={i * 80} className="relative">
              <span className="absolute -left-[41px] sm:-left-[57px] top-1 w-4 h-4 rounded-full bg-gold border-4 border-pond" />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <span className="shrink-0 sm:w-32">
                  <span className="font-display text-3xl sm:text-4xl text-gold leading-none block">{t.time}</span>
                  <span className="text-[11px] text-mist/45 tracking-[0.25em]">{t.date}</span>
                </span>
                <div className="bg-deep/80 border border-lily/15 rounded-md px-5 py-4 flex-1 card-lift">
                  <h3 className="font-display text-xl text-mist">{t.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist/60">{t.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 编辑团队 */}
      <section className="mt-16 sm:mt-24">
        <Reveal className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-lily/70 font-medium">NEWSROOM CREW</p>
            <h2 className="font-display text-3xl sm:text-4xl text-mist mt-2">编辑团队</h2>
          </div>
          <p className="text-xs text-mist/45 hidden sm:block">还有 122 只记者正在外勤 ↗</p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 3) * 100}>
              <div className="group bg-deep border border-lily/15 rounded-md p-5 sm:p-6 text-center card-lift">
                <div className="inline-block transition-transform duration-500 group-hover:scale-105">
                  <div className="transition-transform duration-300 group-hover:[animation:wiggle_0.5s_ease]">
                    <FrogAvatar index={i} accessory={m.accessory} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto" />
                  </div>
                </div>
                <h3 className="font-display text-xl text-mist mt-4">{m.name}</h3>
                <p className="text-[11px] tracking-widest text-gold/90 mt-1">{m.role}</p>
                <p className="mt-3 text-[13px] text-mist/55 leading-relaxed">「{m.quote}」</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 办报准则 */}
      <section className="mt-16 sm:mt-24">
        <Reveal className="mb-8">
          <p className="text-[11px] tracking-[0.35em] text-lily/70 font-medium">PRINCIPLES</p>
          <h2 className="font-display text-3xl sm:text-4xl text-mist mt-2">办报三准则</h2>
        </Reveal>
        <div className="border-t border-lily/20">
          {VALUES.map((v, i) => (
            <Reveal key={v.no} delay={i * 80}>
              <div className="group grid sm:grid-cols-[90px_220px_1fr] gap-3 sm:gap-8 items-baseline border-b border-lily/20 py-7 px-2 sm:px-4 hover:bg-lily/5 hover:px-6 transition-all duration-300">
                <span className="font-display text-3xl text-lily/35 group-hover:text-gold transition-colors">{v.no}</span>
                <h3 className="font-display text-2xl text-mist group-hover:text-gold transition-colors">{v.title}</h3>
                <p className="text-[14px] leading-relaxed text-mist/60">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
