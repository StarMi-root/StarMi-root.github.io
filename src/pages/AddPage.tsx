import { useMemo, useRef, useState } from "react";
import type { Article } from "../data/articles";
import { CATEGORIES, formatRead, todayCN } from "../data/articles";
import { CategoryTag, PatternCover } from "../components/ArticleBits";
import { Reveal } from "../components/Reveal";
import {
  IconCheck,
  IconClose,
  IconFilm,
  IconImage,
  IconUpload,
  IconTrash,
  IconFeather,
} from "../components/icons";

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

function FieldLabel({ no, title, hint }: { no: string; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-display text-gold text-lg">{no}</span>
      <h3 className="font-display text-xl text-mist">{title}</h3>
      {hint && <span className="text-[11px] text-mist/40 ml-auto">{hint}</span>}
    </div>
  );
}

const inputCls =
  "w-full bg-pond/70 border border-lily/25 rounded-md px-4 py-3 text-[14px] text-mist placeholder:text-mist/30 " +
  "focus:border-gold/70 focus:bg-pond transition-colors duration-200";

export default function AddPage({ onPublish }: { onPublish: (a: Article) => void }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [lede, setLede] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [errors, setErrors] = useState<{ title?: boolean; body?: boolean }>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const previewArticle: Article = useMemo(
    () => ({
      id: "preview",
      title: title.trim() || "（这里将显示你的标题）",
      category,
      author: author.trim() || "匿名蛙",
      role: "特约记者",
      time: "刚刚",
      readCount: 0,
      lede: lede.trim() || "（导语选填，一句话勾住读者的好奇心）",
      body: body.split(/\n+/).filter(Boolean),
      cover: cover ?? undefined,
      patternChar: "新",
      images: images.length ? images : undefined,
      video: videoSrc
        ? { kind: "file", src: videoSrc, name: videoName }
        : videoUrl.trim()
          ? { kind: "url", src: videoUrl.trim(), name: "外部链接" }
          : undefined,
      userAdded: true,
    }),
    [title, category, author, lede, body, cover, images, videoSrc, videoName, videoUrl]
  );

  const handleCover = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setCover(await readAsDataURL(f));
  };

  const handleGallery = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 6 - images.length);
    const urls = await Promise.all(list.map(readAsDataURL));
    setImages((prev) => [...prev, ...urls].slice(0, 6));
  };

  const handleVideoFile = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("video/")) return;
    setVideoName(f.name);
    setVideoSrc(URL.createObjectURL(f));
    setVideoUrl("");
  };

  const submit = () => {
    const errs = { title: !title.trim(), body: !body.trim() };
    setErrors(errs);
    if (errs.title || errs.body) {
      setShakeKey((k) => k + 1);
      return;
    }
    setPublishing(true);
    const article: Article = {
      id: "u" + Date.now(),
      title: title.trim(),
      category,
      author: author.trim() || "匿名蛙",
      role: "特约记者",
      time: "刚刚",
      readCount: 1,
      lede: lede.trim() || body.trim().split(/\n+/)[0].slice(0, 60) + "……",
      body: body
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
      cover: cover ?? undefined,
      patternChar: "新",
      images: images.length ? images : undefined,
      video: videoSrc
        ? { kind: "file", src: videoSrc, name: videoName }
        : videoUrl.trim()
          ? { kind: "url", src: videoUrl.trim(), name: "外部链接" }
          : undefined,
      userAdded: true,
    };
    setTimeout(() => onPublish(article), 1400);
  };

  return (
    <div className="page-in max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
      {/* 页首 */}
      <div className="mb-10">
        <p className="fade-up text-[11px] tracking-[0.35em] text-lily/70 font-medium" style={{ animationDelay: "60ms" }}>
          SUBMIT · 报道添加
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-6xl leading-[1.15] text-mist">
          <span className="line-mask">
            <span style={{ ["--ld" as string]: "140ms" }}>发布一期</span>
          </span>
          <span className="line-mask">
            <span style={{ ["--ld" as string]: "300ms" }} className="text-gold">
              新报道
            </span>
          </span>
        </h1>
        <p className="fade-up mt-4 max-w-xl text-[14.5px] leading-relaxed text-mist/60" style={{ animationDelay: "420ms" }}>
          文字、图片、视频都可以装进同一期报道。发布后将置顶出现在首页要闻区，全塘读者即刻可见。
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ===== 表单 ===== */}
        <div className="lg:col-span-7 space-y-8">
          <Reveal>
            <section className="bg-deep border border-lily/15 rounded-md p-5 sm:p-7">
              <FieldLabel no="①" title="基本信息" />
              <div className="space-y-4">
                <div key={errors.title ? shakeKey : "t"} className={errors.title ? "shake" : ""}>
                  <label className="block text-xs font-bold text-mist/70 mb-1.5">
                    报道标题 <span className="text-coral">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((p) => ({ ...p, title: false }));
                    }}
                    maxLength={40}
                    placeholder="例：暴雨夜，编辑部的那盏萤光灯"
                    className={`${inputCls} ${errors.title ? "border-coral/80" : ""}`}
                  />
                  {errors.title && <p className="mt-1.5 text-[11px] text-coral">标题不能为空，读者等着看呢</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-mist/70 mb-1.5">记者署名</label>
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      maxLength={12}
                      placeholder="默认：匿名蛙"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mist/70 mb-1.5">所属栏目</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-all duration-200 cursor-pointer ${
                            category === c
                              ? "bg-gold text-ink border-gold -translate-y-0.5 hard-shadow-sm"
                              : "border-lily/25 text-mist/60 hover:border-lily/60 hover:text-lily"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-mist/70 mb-1.5">导语（选填）</label>
                  <input
                    value={lede}
                    onChange={(e) => setLede(e.target.value)}
                    maxLength={80}
                    placeholder="一句话概括，会显示在卡片上"
                    className={inputCls}
                  />
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section className="bg-deep border border-lily/15 rounded-md p-5 sm:p-7">
              <FieldLabel no="②" title="报道正文" hint="每空一行自动分段" />
              <div key={errors.body ? shakeKey : "b"} className={errors.body ? "shake" : ""}>
                <textarea
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (errors.body) setErrors((p) => ({ ...p, body: false }));
                  }}
                  rows={7}
                  placeholder={"第一段写现场，第二段写背景，第三段写展望……\n\n空一行就是新的一段。"}
                  className={`${inputCls} resize-y leading-relaxed ${errors.body ? "border-coral/80" : ""}`}
                />
                <div className="flex justify-between mt-1.5">
                  {errors.body ? <p className="text-[11px] text-coral">正文至少写点什么，一个字也行</p> : <span />}
                  <span className="text-[11px] text-mist/35">{body.length} 字</span>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section className="bg-deep border border-lily/15 rounded-md p-5 sm:p-7">
              <FieldLabel no="③" title="图片上传" hint="封面 1 张 · 图集最多 6 张" />
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-bold text-mist/70 mb-2 flex items-center gap-1.5">
                    <IconImage className="w-4 h-4 text-lily" /> 封面图
                  </p>
                  {cover ? (
                    <div className="relative group rounded-md overflow-hidden border border-lily/25">
                      <img src={cover} alt="封面预览" className="w-full aspect-[16/10] object-cover" />
                      <button
                        onClick={() => setCover(null)}
                        aria-label="移除封面"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-pond/85 text-mist border border-lily/30 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-coral transition-all cursor-pointer"
                      >
                        <IconClose className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => coverInput.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleCover(e.dataTransfer.files);
                      }}
                      className={`w-full aspect-[16/10] rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        dragOver ? "border-gold bg-gold/10 scale-[1.01]" : "border-lily/30 hover:border-gold/70 hover:bg-lily/5"
                      }`}
                    >
                      <IconUpload className="w-6 h-6 text-lily" />
                      <span className="text-[12.5px] text-mist/55">点击上传或拖入图片</span>
                    </button>
                  )}
                  <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleCover(e.target.files)} />
                </div>
                <div>
                  <p className="text-xs font-bold text-mist/70 mb-2 flex items-center gap-1.5">
                    <IconImage className="w-4 h-4 text-lily" /> 图集（{images.length}/6）
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded-md overflow-hidden border border-lily/20">
                        <img src={img} alt={`图集 ${i + 1}`} className="w-full aspect-square object-cover" />
                        <button
                          onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                          aria-label="移除图片"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pond/85 text-mist border border-lily/30 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-coral transition-all cursor-pointer"
                        >
                          <IconClose className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        onClick={() => galleryInput.current?.click()}
                        className="aspect-square rounded-md border-2 border-dashed border-lily/30 hover:border-gold/70 hover:bg-lily/5 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="添加图集图片"
                      >
                        <span className="font-display text-2xl text-lily/60">+</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={galleryInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleGallery(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={160}>
            <section className="bg-deep border border-lily/15 rounded-md p-5 sm:p-7">
              <FieldLabel no="④" title="视频上传" hint="本地文件 或 直链 URL" />
              {videoSrc ? (
                <div className="relative group rounded-md overflow-hidden border border-lily/25">
                  <video src={videoSrc} controls className="w-full aspect-video bg-pond" />
                  <button
                    onClick={() => {
                      setVideoSrc(null);
                      setVideoName("");
                    }}
                    className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-bold bg-pond/85 text-mist border border-lily/30 rounded-full px-2.5 py-1 opacity-0 group-hover:opacity-100 hover:text-coral transition-all cursor-pointer"
                  >
                    <IconTrash className="w-3.5 h-3.5" /> 移除视频
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => videoInput.current?.click()}
                    className="rounded-md border-2 border-dashed border-lily/30 hover:border-gold/70 hover:bg-lily/5 px-4 py-7 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <IconFilm className="w-6 h-6 text-lily" />
                    <span className="text-[12.5px] text-mist/55">上传本地视频（mp4 / webm）</span>
                  </button>
                  <div className="flex flex-col justify-center gap-2">
                    <label className="text-xs font-bold text-mist/70">或填入视频直链</label>
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://…/report.mp4"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-mist/35">本地视频将以附件形式随报道展示</p>
                  </div>
                  <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(e.target.files)} />
                </div>
              )}
            </section>
          </Reveal>

          {/* 提交 */}
          <Reveal delay={200}>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={submit}
                disabled={publishing}
                className="group flex items-center gap-2.5 bg-gold text-ink font-bold text-[15px] px-8 py-4 rounded-md hard-shadow-gold
                           hover:-translate-y-0.5 hover:bg-[#ffd75e] active:translate-y-0.5 active:shadow-none transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                <IconFeather className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                {publishing ? "正在发送至编辑部…" : "呱！发布这期报道"}
              </button>
              <p className="text-[12px] text-mist/45">发布即代表同意《荷塘新闻自律公约》</p>
            </div>
          </Reveal>
        </div>

        {/* ===== 实时预览 ===== */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <Reveal delay={140}>
            <div className="bg-pond/60 border border-lily/20 rounded-md p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-lily blink-dot" />
                <p className="font-display text-lily tracking-[0.25em] text-sm">实时预览 · 首页卡片效果</p>
              </div>
              <article className="bg-deep border border-lily/25 rounded-md overflow-hidden hard-shadow">
                <div className="relative">
                  {previewArticle.cover ? (
                    <img src={previewArticle.cover} alt="封面预览" className="w-full aspect-[16/10] object-cover" />
                  ) : (
                    <PatternCover char="新" category={category} className="aspect-[16/10]" />
                  )}
                  <div className="absolute top-2.5 left-2.5 flex gap-2">
                    <CategoryTag category={category} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-paper text-ink">新发布</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl leading-snug text-mist">{previewArticle.title}</h3>
                  <p className="mt-2 text-[13px] text-mist/55 line-clamp-2">{previewArticle.lede}</p>
                  <div className="mt-4 pt-3 border-t border-lily/10 flex items-center gap-3 text-[11px] text-mist/45">
                    <span className="text-lily/80 font-medium">{previewArticle.author}</span>
                    <span>刚刚</span>
                    <span className="ml-auto">{formatRead(0)} 阅读</span>
                  </div>
                </div>
              </article>
              <div className="mt-4 space-y-1.5 text-[11.5px] text-mist/45">
                <p className="flex items-center gap-2">
                  <IconCheck className="w-3.5 h-3.5 text-lily" /> 正文 {previewArticle.body.length} 段 · {body.length} 字
                </p>
                <p className="flex items-center gap-2">
                  <IconCheck className="w-3.5 h-3.5 text-lily" /> 图片 {images.length + (cover ? 1 : 0)} 张
                  {videoSrc || videoUrl.trim() ? " · 视频 1 条" : ""}
                </p>
                <p className="flex items-center gap-2 text-gold/80">
                  <IconCheck className="w-3.5 h-3.5" /> 发布后将置顶首页要闻区
                </p>
              </div>
              <p className="mt-3 text-[10.5px] text-mist/30 border-t border-lily/10 pt-3">{todayCN()} · 蛙蛙新闻网收稿处</p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 发布中遮罩 */}
      {publishing && (
        <div className="fixed inset-0 z-[90] bg-pond/92 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border-2 border-lily/60"
                style={{ animation: `ripple 1.5s ease-out ${i * 0.4}s infinite` }}
              />
            ))}
            <span className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center font-display text-4xl text-ink hop-in">
              呱
            </span>
          </div>
          <p className="mt-8 font-display text-2xl text-mist tracking-widest fade-up">正在发送至编辑部…</p>
          <p className="mt-2 text-xs text-mist/50">荷叶邮差已出发，全程约 3 秒</p>
        </div>
      )}
    </div>
  );
}
