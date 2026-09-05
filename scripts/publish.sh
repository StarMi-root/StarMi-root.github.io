#!/usr/bin/env bash
#
# 蛙蛙新闻网 · 一键公网发布脚本
# -------------------------------------------------------------------
# 在本机执行一条命令，即可让全世界（含非局域网设备、微信扫码）
# 不装任何软件、不做任何配置，直接访问本网站：
#
#   1. 自动构建网站（缺依赖会自动 npm install）
#   2. 在本机启动静态服务
#   3. 自动安装并开通 Cloudflare 免费隧道
#      （免注册、免登录、免域名、免配置、免费用）
#   4. 生成全球可访问的 https 公网链接
#   5. 在终端打印二维码，并自动弹出图片二维码
#      —— 另一台设备用微信「扫一扫」即可直接打开网站
#
# 用法：
#   bash scripts/publish.sh               # 全自动：构建 + 发布 + 二维码
#   bash scripts/publish.sh --skip-build  # 跳过构建，直接发布已有 dist
#   PORT=9000 bash scripts/publish.sh     # 指定本地端口（默认 8765）
#
set -euo pipefail

C_GREEN="\033[32m"; C_GOLD="\033[33m"; C_RED="\033[31m"
C_CYAN="\033[36m"; C_BOLD="\033[1m"; C_RESET="\033[0m"
log()  { echo -e "${C_GREEN}[发布]${C_RESET} $*"; }
warn() { echo -e "${C_GOLD}[提示]${C_RESET} $*"; }
die()  { echo -e "${C_RED}[错误]${C_RESET} $*" >&2; exit 1; }

SKIP_BUILD=false
case "${1:-}" in
  --skip-build) SKIP_BUILD=true ;;
  -h|--help) sed -n '2,19p' "$0"; exit 0 ;;
  "") ;;
  *) die "未知参数：$1（支持 --skip-build / --help）" ;;
esac

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
PORT="${PORT:-8765}"
LOG="$(mktemp /tmp/frognews-tunnel-XXXX.log)"
QR_PNG="$(mktemp /tmp/frognews-qr-XXXX.png)"
TUNNEL_PID=""; SERVER_PID=""

cleanup() {
  echo
  log "正在关闭隧道与本地服务 …"
  [[ -n "$TUNNEL_PID" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null || true
  rm -f "$LOG"
}
trap cleanup INT TERM EXIT

# ---------------- 1. 构建 ----------------
if [[ "$SKIP_BUILD" == true ]]; then
  [[ -f dist/index.html ]] || die "--skip-build 但 dist/index.html 不存在，请先构建"
  warn "跳过构建，使用现有 dist/"
else
  command -v npm >/dev/null || die "未找到 npm，无法构建（可加 --skip-build 使用已有 dist）"
  if [[ ! -x node_modules/.bin/vite ]]; then
    warn "检测到项目依赖未安装，正在自动执行 npm install …"
    npm install
  fi
  log "正在构建网站 …"
  npm run build
fi
[[ -f dist/index.html ]] || die "构建产物缺失：dist/index.html"
log "构建完成 ✓（dist/index.html，$(du -h dist/index.html | cut -f1)）"

# ---------------- 2. 选择空闲端口 ----------------
port_free() {
  python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',$1));s.close()" 2>/dev/null \
    || node -e "const s=require('net').createServer();s.once('error',()=>process.exit(1));s.listen($1,'127.0.0.1',()=>{s.close(()=>process.exit(0))})" 2>/dev/null
}
while ! port_free "$PORT"; do
  warn "端口 $PORT 被占用，自动尝试 $((PORT + 1)) …"
  PORT=$((PORT + 1))
done

# ---------------- 3. 启动本地静态服务 ----------------
log "正在本机 $PORT 端口启动网站服务 …"
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT" --bind 0.0.0.0 --directory dist >/dev/null 2>&1 &
  SERVER_PID=$!
elif command -v node >/dev/null 2>&1; then
  SERVE_JS="$(mktemp /tmp/frognews-serve-XXXX.js)"
  cat > "$SERVE_JS" <<'JS'
const http = require("http"), fs = require("fs"), path = require("path");
const port = Number(process.env.FROG_PORT || 8765);
const root = path.join(process.cwd(), "dist");
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(root, p);
  if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) { res.writeHead(404); res.end("404"); return; }
  res.writeHead(200, { "Content-Type": mime[path.extname(fp)] || "application/octet-stream" });
  fs.createReadStream(fp).pipe(res);
}).listen(port, "0.0.0.0", () => console.log("up"));
JS
  FROG_PORT="$PORT" node "$SERVE_JS" >/dev/null 2>&1 &
  SERVER_PID=$!
else
  die "未找到 python3 或 node，无法启动本地服务"
fi
sleep 1
kill -0 "$SERVER_PID" 2>/dev/null || die "本地服务启动失败"

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
LAN_IP="${LAN_IP:-本机局域网 IP}"

# ---------------- 4. 确保 cloudflared 已安装 ----------------
if ! command -v cloudflared >/dev/null 2>&1; then
  case "$(uname -m)" in
    x86_64)        ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) die "不支持的 CPU 架构：$(uname -m)" ;;
  esac
  log "首次运行，正在下载 cloudflared（Cloudflare 官方隧道工具）…"
  curl -fL --retry 2 --connect-timeout 20 \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}" \
    -o /tmp/cloudflared \
    || die "cloudflared 下载失败（GitHub 网络问题），请检查网络后重试"
  chmod +x /tmp/cloudflared
  if [[ -w /usr/local/bin ]]; then
    mv /tmp/cloudflared /usr/local/bin/cloudflared
  else
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    sudo chown root:root /usr/local/bin/cloudflared
  fi
  log "cloudflared 安装完成 ✓"
fi

# ---------------- 5. 开通 Cloudflare 免费隧道 ----------------
log "正在开通 Cloudflare 免费隧道（免注册、免域名）…"
cloudflared tunnel --url "http://127.0.0.1:$PORT" >"$LOG" 2>&1 &
TUNNEL_PID=$!

PUBLIC_URL=""
for _ in $(seq 1 60); do
  PUBLIC_URL="$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$LOG" | head -n1 || true)"
  [[ -n "$PUBLIC_URL" ]] && break
  sleep 1
done
[[ -n "$PUBLIC_URL" ]] || {
  tail -n 15 "$LOG" >&2 || true
  die "隧道开通失败（60 秒未获取到公网链接），请检查本机能否访问外网后重试"
}
log "隧道开通成功 ✓"

# ---------------- 6. 生成二维码 ----------------
if ! command -v qrencode >/dev/null 2>&1; then
  warn "正在安装二维码工具 qrencode（可能需要输入开机密码）…"
  { command -v apt-get >/dev/null && sudo apt-get install -y qrencode >/dev/null; } \
    || { command -v dnf >/dev/null && sudo dnf install -y qrencode >/dev/null; } \
    || warn "qrencode 安装失败，将只显示链接（不影响访问）"
fi

echo
echo -e "${C_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
echo -e "${C_GOLD}${C_BOLD}  🐸 蛙蛙新闻网已发布到公网！${C_RESET}"
echo -e "${C_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
echo -e "  本机访问　: ${C_CYAN}http://127.0.0.1:${PORT}${C_RESET}"
echo -e "  局域网　　: ${C_CYAN}http://${LAN_IP}:${PORT}${C_RESET}"
echo -e "  ${C_BOLD}公网链接　: ${C_CYAN}${C_BOLD}${PUBLIC_URL}${C_RESET}"
echo -e "${C_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"
echo -e "  ${C_GOLD}📱 微信扫码${C_RESET}：打开微信「扫一扫」，对准下方二维码即可访问"
echo -e "  ${C_GOLD}🌍 其它设备${C_RESET}：不在同一局域网也能打开——浏览器输入上方公网链接"
echo -e "${C_BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C_RESET}"

if command -v qrencode >/dev/null 2>&1; then
  echo
  echo -e "${C_BOLD}终端二维码（深色终端直接扫；扫不动就看自动弹出的图片）：${C_RESET}"
  qrencode -t UTF8i -m 1 "$PUBLIC_URL" || true
  qrencode -t PNG -s 14 -m 3 -o "$QR_PNG" "$PUBLIC_URL" 2>/dev/null \
    && { echo -e "${C_GOLD}[提示]${C_RESET} 已生成大尺寸二维码图片：$QR_PNG";
         command -v xdg-open >/dev/null 2>&1 && xdg-open "$QR_PNG" >/dev/null 2>&1 & } \
    || true
fi

echo
warn "链接为临时链接：关闭本终端或电脑关机后失效，重新运行本脚本会生成新链接。"
warn "电脑需保持开机联网。按 Ctrl+C 停止服务。"
echo
log "服务运行中，等待访问 …"
wait "$TUNNEL_PID" 2>/dev/null || true
