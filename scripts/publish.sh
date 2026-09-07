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
#   5. 全自动安装二维码工具（免密码、零交互），
#      在终端打印二维码，并自动弹出图片二维码
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
  -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
  "") ;;
  *) die "未知参数：$1（支持 --skip-build / --help）" ;;
esac

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
PORT="${PORT:-8765}"
LOG="$(mktemp /tmp/frognews-tunnel-XXXX.log)"
QR_PNG="$PROJECT_ROOT/frognews-qrcode.png"
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

# ---------------- 6. 全自动安装二维码工具（免密码、零交互） ----------------
# 四级回退，总有一种能在不问你任何问题的情况下装上：
#   ① 已安装 qrencode → 直接用
#   ② 免密 sudo 可用（root 或 NOPASSWD）→ 系统包管理器装 qrencode
#   ③ pip 安装到用户目录（--user，不需要 sudo）→ Python 二维码库
#   ④ 下载纯标准库的单文件 QR 生成器 → 输出 SVG（零依赖）
# 全部失败也只影响二维码展示，不影响公网链接本身。
QR_MODE="none"   # qrencode | python | svg | none
QR_PY=""

qr_try_pip_user() {
  python3 -m pip --version >/dev/null 2>&1 || return 1
  python3 -m pip install --user --quiet "qrcode[pil]"                    >/dev/null 2>&1 \
    || python3 -m pip install --user --break-system-packages --quiet "qrcode[pil]" >/dev/null 2>&1 \
    || python3 -m pip install --user --quiet qrcode                      >/dev/null 2>&1 \
    || python3 -m pip install --user --break-system-packages --quiet qrcode        >/dev/null 2>&1 \
    || true
  python3 -c "import qrcode" >/dev/null 2>&1 && { QR_PY="python3"; return 0; }
  return 1
}

qr_try_venv() {
  python3 -m venv /tmp/frognews-qr-venv >/dev/null 2>&1 || return 1
  /tmp/frognews-qr-venv/bin/pip install --quiet "qrcode[pil]" >/dev/null 2>&1 \
    || /tmp/frognews-qr-venv/bin/pip install --quiet qrcode >/dev/null 2>&1 || true
  /tmp/frognews-qr-venv/bin/python3 -c "import qrcode" >/dev/null 2>&1 \
    && { QR_PY="/tmp/frognews-qr-venv/bin/python3"; return 0; }
  return 1
}

qr_try_stdlib() {
  curl -fsSL --connect-timeout 15 \
    "https://raw.githubusercontent.com/nayuki/QR-Code-generator/master/python/qrcodegen.py" \
    -o /tmp/frognews_qrcodegen.py >/dev/null 2>&1 || return 1
  python3 -c "import sys; sys.path.insert(0, '/tmp'); import frognews_qrcodegen" >/dev/null 2>&1
}

if command -v qrencode >/dev/null 2>&1; then
  QR_MODE="qrencode"
  log "二维码工具 qrencode 已就绪 ✓"
else
  log "未检测到二维码工具，开始全自动安装（免密码、零交互）…"
  # ② 免密 sudo：系统包管理器
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    for pm in apt-get dnf yum zypper; do
      command -v "$pm" >/dev/null 2>&1 && sudo -n "$pm" install -y qrencode >/dev/null 2>&1 && break
    done
    command -v qrencode >/dev/null 2>&1 \
      || { command -v pacman >/dev/null 2>&1 && sudo -n pacman -S --noconfirm qrencode >/dev/null 2>&1 || true; }
  fi
  if command -v qrencode >/dev/null 2>&1; then
    QR_MODE="qrencode"
    log "已通过系统包管理器装好 qrencode ✓"
  elif command -v python3 >/dev/null 2>&1 && { qr_try_pip_user || qr_try_venv; }; then
    QR_MODE="python"
    log "已自动装好 Python 二维码库（用户目录，未动系统）✓"
  elif command -v python3 >/dev/null 2>&1 && qr_try_stdlib; then
    QR_MODE="svg"
    log "已自动下载纯标准库二维码生成器 ✓"
  else
    warn "自动安装全部未成功，将只显示链接（不影响访问）。"
    warn "想手动装可执行：sudo apt install qrencode 或 pip3 install --user qrcode"
  fi
fi

# 各模式的生成器脚本（一次写好，后面直接调用）
cat > /tmp/frognews_qr_ascii.py <<'PY'
import sys, qrcode
qrcode.print_ascii(sys.argv[1], invert=True)
PY
cat > /tmp/frognews_qr_image.py <<'PY'
import sys, qrcode
url, out = sys.argv[1], sys.argv[2]
try:
    qrcode.make(url, box_size=18).save(out)
    print(out)
except Exception:
    from qrcode.image.svg import SvgPathImage
    out = out.rsplit(".", 1)[0] + ".svg"
    qrcode.make(url, image_factory=SvgPathImage).save(out)
    print(out)
PY
cat > /tmp/frognews_qr_svg_ascii.py <<'PY'
import sys
sys.path.insert(0, "/tmp")
from frognews_qrcodegen import QrCode
qr = QrCode.encode_text(sys.argv[1])
print("\n".join("".join("\u2588\u2588" if qr.get_module(x, y) else "  "
      for x in range(qr.size)) for y in range(qr.size)))
PY
cat > /tmp/frognews_qr_svg_file.py <<'PY'
import sys
sys.path.insert(0, "/tmp")
from frognews_qrcodegen import QrCode
open(sys.argv[2], "w").write(QrCode.encode_text(sys.argv[1]).to_svg_string(4))
PY

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

if [[ "$QR_MODE" != "none" ]]; then
  echo
  echo -e "${C_GOLD}${C_BOLD}  ▼▼ 微信扫码区：打开微信「扫一扫」，对准下方任意一个二维码 ▼▼${C_RESET}"
  echo
  echo -e "  ${C_BOLD}【① 终端里的二维码】（深色背景下直接扫）${C_RESET}"
  echo -e "  ${C_BOLD}【② 图片二维码】（更清晰，已自动弹出，扫①不行就扫②）${C_RESET}"
  echo
  QR_OUT=""
  case "$QR_MODE" in
    qrencode)
      qrencode -t UTF8i -m 2 "$PUBLIC_URL" || true
      echo
      qrencode -t PNG -s 16 -m 3 -o "$QR_PNG" "$PUBLIC_URL" 2>/dev/null && QR_OUT="$QR_PNG" ;;
    python)
      "$QR_PY" /tmp/frognews_qr_ascii.py "$PUBLIC_URL" || true
      echo
      QR_OUT="$("$QR_PY" /tmp/frognews_qr_image.py "$PUBLIC_URL" "$QR_PNG" 2>/dev/null || true)" ;;
    svg)
      python3 /tmp/frognews_qr_svg_ascii.py "$PUBLIC_URL" || true
      echo
      if python3 /tmp/frognews_qr_svg_file.py "$PUBLIC_URL" "${QR_PNG%.png}.svg" 2>/dev/null; then
        QR_OUT="${QR_PNG%.png}.svg"
      fi ;;
  esac
  if [[ -n "$QR_OUT" && -f "$QR_OUT" ]]; then
    echo -e "${C_GREEN}[二维码]${C_RESET} 高清二维码图片已保存到项目根目录："
    echo -e "         ${C_CYAN}${C_BOLD}$QR_OUT${C_RESET}"
    echo -e "${C_GREEN}[二维码]${C_RESET} 已尝试自动打开该图片，如未弹出可手动双击上面这个文件"
    command -v xdg-open >/dev/null 2>&1 && xdg-open "$QR_OUT" >/dev/null 2>&1 &
  else
    warn "图片二维码生成失败，请直接扫上方终端里的二维码"
  fi
else
  warn "未安装二维码工具，无法显示二维码。请直接在另一台设备浏览器输入上方公网链接。"
fi

echo
warn "链接为临时链接：关闭本终端或电脑关机后失效，重新运行本脚本会生成新链接。"
warn "电脑需保持开机联网。按 Ctrl+C 停止服务。"
echo
log "服务运行中，等待访问 …"
wait "$TUNNEL_PID" 2>/dev/null || true
