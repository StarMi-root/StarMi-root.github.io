import type { ViewId } from "../data/articles";
import { CATEGORIES } from "../data/articles";
import { FrogLogo, IconPin, IconMail, IconWave } from "./icons";

export default function Footer({
  onNavigate,
  onCategory,
}: {
  onNavigate: (v: ViewId) => void;
  onCategory: (c: string) => void;
}) {
  return (
    <footer className="relative border-t-2 border-lily/20 bg-[#091a10] mt-16">
      {/* 荷叶波浪边 */}
      <div className="absolute -top-px inset-x-0 overflow-hidden leading-none" aria-hidden="true">
        <svg className="w-full h-3 text-lily/25" preserveAspectRatio="none" viewBox="0 0 1200 12">
          <path
            d="M0 12 Q 25 0 50 12 T 100 12 T 150 12 T 200 12 T 250 12 T 300 12 T 350 12 T 400 12 T 450 12 T 500 12 T 550 12 T 600 12 T 650 12 T 700 12 T 750 12 T 800 12 T 850 12 T 900 12 T 950 12 T 1000 12 T 1050 12 T 1100 12 T 1150 12 T 1200 12 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <FrogLogo className="w-11 h-11" />
            <div>
              <p className="font-display text-xl text-mist leading-none">蛙蛙新闻网</p>
              <p className="text-[10px] tracking-[0.3em] text-lily/60 mt-1">FROG DAILY</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-mist/50">
            呱得准，更要呱得真。
            <br />
            每天清晨六点，为全塘读者送上带露水的新闻。
          </p>
        </div>

        <div>
          <h4 className="font-display text-lily tracking-widest text-sm mb-4">导航</h4>
          <ul className="space-y-2.5 text-[13.5px]">
            {(
              [
                ["home", "首页 · 今日头版"],
                ["about", "报社详情 · 创刊理想"],
                ["add", "报道添加 · 全媒投稿"],
              ] as [ViewId, string][]
            ).map(([v, label]) => (
              <li key={v}>
                <button onClick={() => onNavigate(v)} className="nav-link-underline text-mist/65 hover:text-gold transition-colors cursor-pointer">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lily tracking-widest text-sm mb-4">栏目</h4>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => onCategory(c)}
                className="px-3 py-1.5 rounded-full border border-lily/20 text-[12.5px] text-mist/60 hover:border-gold/60 hover:text-gold hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lily tracking-widest text-sm mb-4">联系编辑部</h4>
          <ul className="space-y-3 text-[13px] text-mist/60">
            <li className="flex items-start gap-2.5">
              <IconPin className="w-4 h-4 text-lily/70 shrink-0 mt-0.5" />
              青蛙塘中央睡莲大厦三层（邮递请投递至第三片荷叶）
            </li>
            <li className="flex items-center gap-2.5">
              <IconMail className="w-4 h-4 text-lily/70 shrink-0" />
              <a href="mailto:wB251046886@163.com" className="hover:text-gold transition-colors break-all">
                wB251046886@163.com
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <IconWave className="w-4 h-4 text-lily/70 shrink-0" />
              呱呱热线 400-GUA-GUA（水陆两用）
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-lily/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-mist/35">
          <p>© 2026 蛙蛙新闻网 · 蛙ICP备20260001号 · 转载请注明出处并呱一声</p>
          <p className="flex items-center gap-2">
            本报用纸均为再生荷叶
            <span className="font-display text-lily/60 tracking-widest">呱 ◈ 呱 ◈ 呱</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
