import { useEffect, useState } from "react";
import type { Article } from "../data/articles";
import { formatRead } from "../data/articles";
import { IconClock, IconEye, IconClose, IconImage, IconFilm } from "./icons";

/** 带失败兜底的图片：远程图加载失败时回退为荷叶纹样，避免永远转圈 */
export function SafeImg({
  src,
  alt,
  className = "",
  char = "闻",
}: {
  src: string;
  alt: string;
  className?: string;
  char?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`relative overflow-hidden bg-fern flex items-center justify-center ${className}`}>
        <span className="font-display text-5xl text-lily/25 select-none">{char}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

const CATEGORY_COLOR: Record<string, string> = {
  时政: "bg-coral/90 text-paper",
  财经: "bg-gold text-ink",
  文化: "bg-lily text-ink",
  体育: "bg-[#57b8d8] text-ink",
  科技: "bg-[#a5d86e] text-ink",
  社会: "bg-[#e89b5a] text-ink",
};

export function CategoryTag({ category, small = false }: { category: string; small?: boolean }) {
  return (
    <span
      className={`inline-block font-bold ${small ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"} rounded-sm ${
        CATEGORY_COLOR[category] ?? "bg-lily text-ink"
      }`}
    >
      {category}
    </span>
  );
}

/** 无图文章的纹样封面 */
export function PatternCover({ char, category, className = "" }: { char: string; category: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-fern ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.16]" aria-hidden="true">
        <defs>
          <pattern id={`dots-${char}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2" fill="#8FD65A" />
            <circle cx="17" cy="17" r="1.4" fill="#F5C842" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${char})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[88px] leading-none text-lily/30 select-none">{char}</span>
      </div>
      <div className="absolute bottom-2 left-3">
        <CategoryTag category={category} small />
      </div>
    </div>
  );
}

export function ArticleCover({
  article,
  className = "",
  imgClass = "",
}: {
  article: Article;
  className?: string;
  imgClass?: string;
}) {
  if (article.cover) {
    return (
      <div className={`relative overflow-hidden bg-moss ${className}`}>
        <SafeImg
          src={article.cover}
          alt={article.title}
          char={article.title.charAt(0)}
          className={`w-full h-full object-cover ${imgClass}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pond/55 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }
  return <PatternCover char={article.patternChar ?? "闻"} category={article.category} className={className} />;
}

/** 要闻卡片 */
export function ArticleCard({
  article,
  onOpen,
  index = 0,
}: {
  article: Article;
  onOpen: (a: Article) => void;
  index?: number;
}) {
  return (
    <article
      onClick={() => onOpen(article)}
      className="group cursor-pointer bg-deep border border-lily/15 rounded-md overflow-hidden card-lift flex flex-col h-full"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative">
        <ArticleCover
          article={article}
          className="aspect-[16/10]"
          imgClass="transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
          <CategoryTag category={article.category} />
          {article.userAdded && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-paper text-ink border border-ink/20">新发布</span>
          )}
        </div>
        {article.video && (
          <span className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-pond/80 border border-lily/40 flex items-center justify-center text-lily">
            <IconFilm className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg sm:text-xl leading-snug text-mist group-hover:text-gold transition-colors duration-300 line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-mist/55 line-clamp-2 flex-1">{article.lede}</p>
        <div className="mt-4 pt-3 border-t border-lily/10 flex items-center gap-3 text-[11px] text-mist/45">
          <span className="text-lily/80 font-medium">{article.author}</span>
          <span className="flex items-center gap-1">
            <IconClock className="w-3.5 h-3.5" />
            {article.time}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <IconEye className="w-3.5 h-3.5" />
            {formatRead(article.readCount)}
          </span>
        </div>
      </div>
    </article>
  );
}

/** 阅读弹窗 */
export function ArticleModal({ article, onClose }: { article: Article | null; onClose: () => void }) {
  useEffect(() => {
    if (!article) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [article, onClose]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div className="absolute inset-0 bg-pond/85 backdrop-blur-sm" onClick={onClose} />
      <div className="pop-in relative w-full sm:max-w-3xl max-h-[88vh] overflow-y-auto bg-deep border border-lily/25 sm:rounded-lg rounded-t-xl hard-shadow">
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 sm:px-8 py-3.5 bg-deep/95 backdrop-blur-sm border-b border-lily/15">
          <CategoryTag category={article.category} />
          {article.userAdded && <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-paper text-ink">新发布</span>}
          <span className="text-[11px] text-mist/45 ml-auto">蛙蛙新闻网 · {article.time}</span>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-md border border-lily/25 text-mist/70 hover:text-coral hover:border-coral/60 hover:rotate-90 transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <h2 className="font-display text-2xl sm:text-4xl leading-tight text-mist">{article.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-mist/55 pb-5 border-b border-lily/12">
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-fern border border-lily/30 flex items-center justify-center font-display text-[13px] text-lily">
                {article.author.slice(0, 1)}
              </span>
              <span>
                <b className="text-mist/85">{article.author}</b> · {article.role}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <IconClock className="w-3.5 h-3.5" /> {article.time}
            </span>
            <span className="flex items-center gap-1">
              <IconEye className="w-3.5 h-3.5" /> {formatRead(article.readCount)} 次阅读
            </span>
          </div>

          {article.cover && (
            <div className="mt-6 rounded-md overflow-hidden border border-lily/15">
              <SafeImg src={article.cover} alt={article.title} char={article.title.charAt(0)} className="w-full object-cover min-h-24" />
            </div>
          )}

          <p className="mt-6 text-[15px] leading-relaxed text-gold/90 font-medium border-l-4 border-gold/70 pl-4">
            {article.lede}
          </p>

          {article.video && (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs text-lily/80 mb-2">
                <IconFilm className="w-4 h-4" /> 随片视频 ·{" "}
                {article.video.kind === "file" ? article.video.name ?? "本地上传" : "外部链接"}
              </div>
              <video src={article.video.src} controls className="w-full rounded-md border border-lily/20 bg-pond" />
            </div>
          )}

          <div className="mt-6 space-y-5">
            {article.body.map((p, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.9] text-mist/80 first-letter:font-bold first-letter:text-lily first-letter:text-xl"
              >
                {p}
              </p>
            ))}
          </div>

          {article.images && article.images.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center gap-2 text-xs text-lily/80 mb-3">
                <IconImage className="w-4 h-4" /> 现场图集（{article.images.length}）
              </div>
              <div className="grid grid-cols-2 gap-3">
                {article.images.map((img, i) => (
                  <SafeImg
                    key={i}
                    src={img}
                    alt={`${article.title} 图 ${i + 1}`}
                    char={article.title.charAt(0)}
                    className="w-full aspect-[4/3] object-cover rounded-md border border-lily/15 hover:border-lily/50 transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-lily/12 flex items-center justify-between text-[11px] text-mist/40">
            <span>© 蛙蛙新闻网 · 转载请先呱一声</span>
            <span className="font-display text-lily/60 tracking-widest">望闻问切 · END</span>
          </div>
        </div>
      </div>
    </div>
  );
}
