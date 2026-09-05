#!/usr/bin/env bash
#
# 蛙蛙新闻网 · 在本机直接运行网站
# -------------------------------------------------------------------
# 用法：
#   bash scripts/serve-local.sh                # 快速运行：http://localhost:8080（关掉终端即停止）
#   bash scripts/serve-local.sh --port 9000    # 自定义端口
#   bash scripts/serve-local.sh --build        # 先重新构建再运行
#   sudo bash scripts/serve-local.sh --system  # 安装为 nginx 常驻服务：端口 80，开机自启
#
# 公网访问见脚本末尾提示 / scripts/README.md
#
set -euo pipefail

C_GREEN="\033[32m"; C_YELLOW="\033[33m"; C_RED="\033[31m"; C_CYAN="\033[36m"; C_RESET="\033[0m"
log()  { echo -e "${C_GREEN}[本机服务]${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}[提示]${C_RESET} $*"; }
die()  { echo -e "${C_RED}[错误]${C_RESET} $*" >&2; exit 1; }

PORT=8080
SYSTEM=false
DO_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) PORT="${2:?--port 需要端口号}"; shift 2 ;;
    --system) SYSTEM=true; shift ;;
    --build) DO_BUILD=true; shift ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) die "未知参数：$1（--help 查看用法）" ;;
  esac
done

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------------- 构建检查 ----------------
if [[ "$DO_BUILD" == true || ! -f dist/index.html ]]; then
  command -v npm >/dev/null || die "dist/index.html 不存在且未找到 npm，无法构建"
  if [[ ! -x node_modules/.bin/vite ]]; then
    warn "依赖未安装，先执行 npm install …"
    npm install
  fi
  log "正在构建 …"
  npm run build
fi
[[ -f dist/index.html ]] || die "构建产物缺失：dist/index.html"

# ---------------- 访问地址 ----------------
LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
TS_IP="$(command -v tailscale >/dev/null 2>&1 && tailscale ip -4 2>/dev/null || true)"

print_urls() {
  local p="$1"
  echo ""
  echo -e "${C_CYAN}════════════════ 蛙蛙新闻网已上线 ════════════════${C_RESET}"
  echo -e "  本机访问　　${C_GREEN}http://localhost:${p}${C_RESET}"
  [[ -n "${LAN_IP:-}" ]] && \
  echo -e "  局域网访问　${C_GREEN}http://${LAN_IP}:${p}${C_RESET}　（同一 WiFi 的手机/电脑）"
  [[ -n "${TS_IP:-}" ]] && \
  echo -e "  Tailscale　 ${C_GREEN}http://${TS_IP}:${p}${C_RESET}　（同一 Tailnet 的任意设备，跨网也行）"
  echo -e "${C_CYAN}══════════════════════════════════════════════════${C_RESET}"
  echo ""
}

# ---------------- 模式一：nginx 常驻服务（--system） ----------------
if [[ "$SYSTEM" == true ]]; then
  [[ $EUID -ne 0 ]] && exec sudo bash "$0" --system --port "$PORT"

  if command -v apt-get >/dev/null 2>&1; then
    command -v nginx >/dev/null 2>&1 || { log "安装 Nginx …"; apt-get update -qq; apt-get install -y nginx; }
  elif command -v dnf >/dev/null 2>&1; then
    command -v nginx >/dev/null 2>&1 || { log "安装 Nginx …"; dnf install -y nginx; }
  elif command -v yum >/dev/null 2>&1; then
    command -v nginx >/dev/null 2>&1 || { log "安装 Nginx …"; yum install -y nginx; }
  else
    die "未识别的包管理器，请手动安装 nginx 后重试"
  fi

  log "部署站点到 /var/www/frognews …"
  mkdir -p /var/www/frognews
  cp -f dist/* /var/www/frognews/

  cat > /etc/nginx/conf.d/frognews.conf <<EOF
server {
    listen ${PORT} default_server;
    listen [::]:${PORT} default_server;
    server_name _;

    root /var/www/frognews;
    index index.html;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
EOF
  # 若默认站点占用同一端口则停用它
  [[ -f /etc/nginx/sites-enabled/default ]] && rm -f /etc/nginx/sites-enabled/default

  nginx -t || die "Nginx 配置校验失败，请查看上方报错"
  systemctl enable nginx >/dev/null 2>&1 || true
  systemctl restart nginx
  log "已安装为系统服务（开机自启）✓ 停止：sudo systemctl stop nginx"
  print_urls "$PORT"
  warn "若局域网设备打不开，放行端口：sudo ufw allow $PORT"
  exit 0
fi

# ---------------- 模式二：快速运行（python / npx serve） ----------------
print_urls "$PORT"
log "按 Ctrl+C 停止服务"
echo ""

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory dist
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" dist
else
  die "需要 python3 或 npx 其一来启动服务"
fi
