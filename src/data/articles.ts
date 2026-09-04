export type ViewId = "home" | "about" | "add";

/** 编辑部配图（远程插画） */
export const IMG = {
  council:
    "https://image.qwenlm.ai/generated-images/bdc6c769-f426-4400-aee3-0a4a4e593a87/_result.png",
  newsroom:
    "https://image.qwenlm.ai/generated-images/39a68763-bf78-4d8c-bef3-0944be0a5e83/_result.png",
  cricket:
    "https://image.qwenlm.ai/generated-images/eddff5cf-0d0c-4c90-aa71-d54684a397d4/_result.png",
  tadpole:
    "https://image.qwenlm.ai/generated-images/0044dddc-b316-4239-b190-0c45aae4080b/_result.png",
  drone:
    "https://image.qwenlm.ai/generated-images/a4e6c6f8-2b02-4f0e-979f-edd745bdc91d/_result.png",
};

export interface ArticleVideo {
  kind: "file" | "url";
  src: string;
  name?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  role: string;
  time: string;
  readCount: number;
  lede: string;
  body: string[];
  cover?: string;
  patternChar?: string;
  images?: string[];
  video?: ArticleVideo;
  userAdded?: boolean;
}

export const CATEGORIES = ["时政", "财经", "文化", "体育", "科技", "社会"];

export const TICKER_ITEMS = [
  "突发 | 荷塘议会全票通过《浮萍保护法》，违者罚捉虫三日",
  "快讯 | 蚊虫期货盘中一度涨超 200%，交易所临时停牌",
  "直击 | 蝌蚪奥运自由泳预赛：三号赛道选手尾部摆动频率创纪录",
  "气象 | 今夜有流星雨，编辑部提醒：抬头观星请勿张嘴",
  "公告 | 蛙蛙新闻网投稿通道全面升级，支持图片与视频上传",
  "暖闻 | 老蟾蜍拾金不昧，归还蜻蜓遗失的露珠三颗",
];

export const SEED_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "荷塘议会全票通过《浮萍保护法》，三百只蛙齐鸣庆祝",
    category: "时政",
    author: "蛙大嘴",
    role: "首席记者",
    time: "今晨 06:12",
    readCount: 48200,
    lede:
      "经过连续三夜的鸣唱辩论，荷塘议会于今晨以全票通过了酝酿已久的《浮萍保护法》。法案规定，任何蛙不得擅自吞食直径小于两厘米的浮萍幼苗，违者将被罚捉虫三日。",
    body: [
      "表决现场，三百余只各品种蛙类齐聚中央荷叶会场。议长蛙长老在宣布结果时连说三声「呱」，这是荷塘议会历史上第一次出现全票通过的重大法案。旁听席上的蝌蚪们激动地原地转圈，水面一度出现小型漩涡。",
      "《浮萍保护法》共九章四十二条，涵盖浮萍种植、采摘配额、幼苗保护与跨塘贸易等内容。法案起草组组长蛙算盘向记者表示：「浮萍是荷塘经济的基本盘，保护好幼苗，就是保护好我们舌尖上的未来。」",
      "据悉，执法队伍将由塘中体格最健硕的牛蛙组成，首期编制十二只，统一配发荷叶袖标。另有消息称，邻塘的蟾蜍代表团已发来贺电，表示将参考本法制定本塘的《苔藓条例》。",
    ],
    cover: IMG.council,
    images: [IMG.council, IMG.newsroom],
  },
  {
    id: "a2",
    title: "蚊虫期货暴涨 180%，「舌尖经济」再创历史新高",
    category: "财经",
    author: "蛙算盘",
    role: "财经主编",
    time: "昨日 18:40",
    readCount: 35600,
    lede:
      "受连续降雨与夜间灯会双重利好刺激，蚊虫期货主力合约单日暴涨 180%，带动整个「舌尖经济」板块飘红，荷塘交易所成交额创开市以来新高。",
    body: [
      "盘面显示，蚊虫主力合约开盘即封死涨停，苍蝇期权、飞蛾ETF 全线跟涨。分析人士指出，夏季蚊虫供应量趋紧，而各塘餐饮需求持续旺盛，供需剪刀差是本轮行情的核心逻辑。",
      "「现在不是蛙挑虫，是虫挑蛙。」资深捕食员蛙大舌接受采访时坦言，由于竞争激烈，年轻蛙的捕虫成功率较五年前下降了近三成，「舌头快」已经不够用了，还得「预判准」。",
      "交易所提醒广大蛙民：舌尖经济波动剧烈，暴饮暴食存在健康风险，理性进食，切勿追高。",
    ],
    patternChar: "涨",
  },
  {
    id: "a3",
    title: "蟋蟀乐队「夏夜巡演」门票三秒售罄，黄牛蛙连夜排队",
    category: "文化",
    author: "蛙小唱",
    role: "文化记者",
    time: "昨日 21:05",
    readCount: 29800,
    lede:
      "传奇蟋蟀乐队「振翅」宣布开启十二塘巡回演出，开票三秒即告售罄。不少蛙从昨夜起就在售票荷叶前排起长队，现场秩序由蜻蜓安保队维持。",
    body: [
      "「振翅」乐队成立至今已有六个夏天，凭借《月光下的摩擦音》《翅膀与远方》等金曲横扫荷塘金曲榜。主唱蟀哥在发布会上透露，本轮巡演将首次加入萤火虫灯光组，「我们要让每一个夜晚都亮起来」。",
      "为打击黄牛，主办方推出「蛙脸识别」入场系统，每只蛙限购两张荷叶票。但仍有黄牛蛙铤而走险，据现场蛙民反映，有蛙一夜之间变换了七种肤色试图重复购票，已被安保请出荷塘。",
      "文化评论家蛙半仙认为，蟋蟀乐队的走红标志着荷塘演艺市场进入「振翅时代」，「当翅膀摩擦的声音也能成为艺术，说明我们的审美真正多元了」。",
    ],
    cover: IMG.cricket,
    images: [IMG.cricket],
  },
  {
    id: "a4",
    title: "蝌蚪奥运自由泳预赛：四项纪录作古，尾巴就是生产力",
    category: "体育",
    author: "蛙飞毛",
    role: "体育记者",
    time: "今日 09:30",
    readCount: 22400,
    lede:
      "蝌蚪奥运会自由泳预赛今日在清水湾泳馆落幕，共有四项赛会纪录被刷新。赛后采访中，破纪录选手蚪蚪强表示：「尾巴摆得快，全靠小时候营养好。」",
    body: [
      "最引人注目的是 100 厘米自由泳决赛资格的争夺，三号赛道选手蚪蚪强以 3.2 秒的成绩刷新纪录，其尾部摆动频率达到每秒 14 次，被现场解说称为「装了马达的尾巴」。",
      "本届蝌蚪奥运首次引入高速水波摄像系统，每场比赛生成「摆尾轨迹图」，供教练团队复盘。专家提醒，蝌蚪选手正处于「长腿关键期」，训练量需科学控制，避免影响变态发育进程。",
      "组委会同时宣布，鉴于近期蛙口出生率上升，下一届蝌蚪奥运将新增「集体转圈」表演项目，预计参赛规模将翻倍。",
    ],
    cover: IMG.tadpole,
    images: [IMG.tadpole],
  },
  {
    id: "a5",
    title: "两栖科学院发布「荷叶三号」无人机，续航提升三倍",
    category: "科技",
    author: "蛙博士",
    role: "科技记者",
    time: "昨日 14:20",
    readCount: 18900,
    lede:
      "两栖科学院今日发布新一代荷叶无人机「荷叶三号」，采用仿生叶脉供电结构，续航时间提升至旧款的三倍，可连续巡航整个荷塘。",
    body: [
      "「荷叶三号」最大亮点是叶脉式太阳能收集网络，能在阴天保持 60% 的充电效率。机身材料来自可再生荷叶纤维，坠塘后可完全降解，不会造成水体污染——这一点获得了环保组织「清水会」的高度评价。",
      "科学院首席工程师蛙爱迪介绍，新机还搭载了「虫群雷达」，可实时绘制蚊虫密度热力图，数据将免费开放给全塘蛙民，「科技的意义，是让每一只蛙都能吃饱」。",
      "首批「荷叶三号」将于下周交付荷塘日报社与快递站使用。有蛙民建议推出载人版本，蛙爱迪回应：「先解决续航，再谈载蛙，科学来不得半点跳跃。」",
    ],
    cover: IMG.drone,
    images: [IMG.drone],
  },
  {
    id: "a6",
    title: "暴雨橙色预警：编辑部全员转入水下办公，报纸照常发行",
    category: "社会",
    author: "蛙呱呱",
    role: "气象主播",
    time: "今日 07:55",
    readCount: 15200,
    lede:
      "气象台今晨发布暴雨橙色预警，预计今夜至明晨有大到暴雨。蛙蛙新闻网已启动应急预案，全员转入水下办公模式，今日报纸照常发行。",
    body: [
      "记者了解到，编辑部水下办公区位于荷塘东侧三米深处，配备防水荷叶键盘与气泡通讯系统。值班编辑蛙小跳表示，水下办公的最大优势是「绝对安静」，缺点则是「墨汁容易被冲散」。",
      "为保障投递，邮递员队伍已扩编至四十只，全部换装防水睡莲邮包。气象主播蛙呱呱提醒广大蛙民：暴雨期间请收紧荷叶屋顶，外出携带浮萍雨具，谨防被水流冲入邻塘。",
      "另据水文站数据，当前荷塘水位 1.82 米，距警戒水位还有 0.6 米余量，防汛物资（沙袋、水草、备用荷叶）储备充足。",
    ],
    patternChar: "雨",
  },
  {
    id: "a7",
    title: "复刊十周年特辑：一张荷叶，如何撑起一份报纸",
    category: "文化",
    author: "蛙长老",
    role: "总编辑",
    time: "昨日 08:00",
    readCount: 41700,
    lede:
      "十年前的今天，蛙蛙新闻网在一场暴雨后的清晨复刊，第一份报纸印在一片巴掌大的荷叶上，发行量 37 份。十年过去，这片荷叶已经长成一张覆盖三百多个荷塘的新闻网络。",
    body: [
      "走进编辑部的荣誉室，那片创刊荷叶被保存在露珠恒温箱中，叶脉间依稀可辨当年手写的头条：「雨停了，太阳出来了，虫子多了」。总编辑蛙长老说，这句话奠定了报社十年的基调——永远报道蛙民最关心的事。",
      "十年间，报社经历了三次搬迁、两次洪水、一次罕见的冬季停刊，记者队伍从 4 只发展到 128 只。唯一不变的，是每天清晨六点准时响起的开编会蛙鸣，和那句挂在墙上的社训：「呱得准，更要呱得真。」",
      "值此十周年之际，本社同步上线全新官网，支持图片、视频全媒体投稿。蛙长老在寄语中写道：「下一个十年，我们希望每一片荷叶，都是一个头条。」",
    ],
    cover: IMG.newsroom,
    images: [IMG.newsroom, IMG.council],
  },
];

export function formatRead(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + " 万";
  return String(n);
}

export function todayCN(): string {
  const d = new Date();
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${weeks[d.getDay()]}`;
}

export function issueNo(): number {
  const start = new Date("2016-06-01").getTime();
  const days = Math.floor((Date.now() - start) / 86400000);
  return 1286 + days;
}
