#!/usr/bin/env bash
#
# 蛙蛙新闻网 · 本机运行 + 公网隧道（任何设备、任何网络都能访问）
# -------------------------------------------------------------------
# 原理：网站跑在你这台电脑上，然后通过一条加密隧道把它暴露到公网，
#       生成一个 https 链接（或二维码）。另一台设备——不管在哪个网络、
#       装没装任何东西——用浏览器打开这个链接即可。
#
# 隧道优先级：
#   1. Tailscale Funnel（你已装 Tailscale 时自动使用，链接长期稳定）
#   2. Cloudflare 临时隧道（自动安装 cloudflared，免注册，链接随机）
#
# 用法：
#   bash scripts/publish-public.sh                 # 构建 + 启动 + 暴露公网
#   bash scripts/publish-public.sh --skip-build    # 跳过构建
#   bash scripts/publish-public.sh --port 9090     # 指定端口
#
# 结束：Ctrl+C 即可同时关掉服务器和隧道。
#
set -euo pipefail

C_GREEN="\033[32m"; C_YELLOW="\033[33m"; C_CYAN="\033[36m"; C_RESET="\033[0m"
log()  { echo -e "${C_GREEN}[发布]${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}[提示]${C_RESET} $*"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

SKIP_BUILD=false
PORT=8080
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift ;;
    --port) PORT="${2:?--port 需要一个端口号}"; shift 2 ;;
    *) shift ;;
  esac
done

# ---------- 1. 构建 ----------
if [[ "$SKIP_BUILD" == false ]]; then
  if [[ ! -d node_modules || ! -d node_modules/vite ]]; then
    log "首次运行，自动安装依赖 …"
    npm install
  fi
  log "正在构建 …"
  npm run build
fi
[[ -f dist/index.html ]] || { echo "缺少 dist/index.html，请去掉 --skip-build 重新运行"; exit 1; }

# ---------- 2. 启动本地服务器 ----------
log "启动本地服务 http://localhost:$PORT …"
python3 -m http.server "$PORT" --directory dist >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 1

# ---------- 3. 暴露公网 ----------
echo
echo "============================================================"

if command -v tailscale >/dev/null 2>&1; then
  warn "检测到 Tailscale，使用 Funnel 生成稳定的 https 链接 …"
  warn "（首次使用需在 https://login.tailscale.com/admin/acls 启用 Funnel）"
  echo
  # Funnel 会自己打印链接，前台运行，Ctrl+C 一并退出
  exec tailscale funnel "$PORT"
elif command -v cloudflared >/dev/null 2>&1; then
  warn "使用 Cloudflare 临时隧道（免注册） …"
elif command -v apt-get >/dev/null 2>&1; then
  warn "未找到隧道工具，正在安装 cloudflared …"
  curl -fsSL -o /tmp/cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  && sudo dpkg -i /tmp/cloudflared.deb
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y cloudflared || {
    curl -fsSL -o /tmp/cloudflared.rpm \
      https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
    sudo rpm -i /tmp/cloudflared.rpm
  }
else
  echo "请手动安装 cloudflared 或 tailscale 后重试。"
  exit 1
fi

echo
echo -e "${C_CYAN}公网链接（下方日志中的 https://xxxx.trycloudflare.com）：${C_RESET}"
echo "  · 复制该链接，发到任何设备的浏览器即可打开"
echo "  · 手机上可以直接打开，无需安装任何 App"
echo "  · 关闭本窗口（Ctrl+C）即停止服务"
echo "============================================================"
echo

# cloudflared 前台运行，Ctrl+C 一并退出；trap 会自动关掉本地服务器
exec cloudflared tunnel --url "http://localhost:$PORT"
