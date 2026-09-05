#!/usr/bin/env bash
#
# 蛙蛙新闻网 · 服务器端一键部署脚本
# -------------------------------------------------------------------
# 在目标 Linux 服务器上运行（Ubuntu / Debian / CentOS / RHEL /
# Rocky / AlmaLinux / Fedora 均支持）。
#
# 功能：
#   1. 自动识别发行版并安装 Nginx
#   2. 部署静态站点到 /var/www/frognews
#   3. 写入 Nginx 站点配置（gzip、SPA 回退、HTML 不缓存）
#   4. 自动放行防火墙 22/80/443（ufw / firewalld 自适应）
#   5. 可选：--domain 自动申请 Let's Encrypt 证书并强制 HTTPS
#   6. 部署后自检，输出公网访问地址
#
# 用法：
#   sudo bash server-setup.sh /path/to/dist
#   sudo bash server-setup.sh /path/to/dist --domain news.example.com --email you@example.com
#
set -euo pipefail

# ---------------- 日志与颜色 ----------------
C_GREEN="\033[32m"; C_YELLOW="\033[33m"; C_RED="\033[31m"; C_RESET="\033[0m"
log()  { echo -e "${C_GREEN}[部署]${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}[提示]${C_RESET} $*"; }
die()  { echo -e "${C_RED}[错误]${C_RESET} $*" >&2; exit 1; }

usage() {
  sed -n '2,20p' "$0"
}

# ---------------- 自动提权 ----------------
if [[ $EUID -ne 0 ]]; then
  command -v sudo >/dev/null || die "请以 root 运行：sudo bash $0 $*"
  exec sudo bash "$0" "$@"
fi

# ---------------- 参数解析 ----------------
SITE_DIR=""
DOMAIN=""
EMAIL=""
WEB_ROOT="/var/www/frognews"
CONF_PATH="/etc/nginx/conf.d/frognews.conf"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:?--domain 需要一个域名}"; shift 2 ;;
    --email)  EMAIL="${2:?--email 需要一个邮箱}";   shift 2 ;;
    -h|--help) usage; exit 0 ;;
    -*) die "未知参数：$1（使用 --help 查看用法）" ;;
    *)  [[ -z "$SITE_DIR" ]] && SITE_DIR="$1" || die "多余参数：$1"; shift ;;
  esac
done

SITE_DIR="${SITE_DIR:-$(pwd)/dist}"
[[ -d "$SITE_DIR" && -f "$SITE_DIR/index.html" ]] \
  || die "找不到站点目录：$SITE_DIR（需包含 index.html）"

# ---------------- 1. 识别发行版并安装 Nginx ----------------
if   command -v apt-get >/dev/null 2>&1; then PKG="apt"
elif command -v dnf     >/dev/null 2>&1; then PKG="dnf"
elif command -v yum     >/dev/null 2>&1; then PKG="yum"
else die "未识别的包管理器，请手动安装 nginx 后重试"
fi

log "检测到包管理器：$PKG，开始安装 Nginx …"
case "$PKG" in
  apt)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y -qq
    apt-get install -y -qq nginx curl ca-certificates ;;
  dnf) dnf install -y -q nginx curl ca-certificates ;;
  yum) yum install -y -q nginx curl ca-certificates ;;
esac
log "Nginx 安装完成：$(nginx -v 2>&1)"

# ---------------- 2. 部署站点文件 ----------------
log "部署站点：$SITE_DIR → $WEB_ROOT"
mkdir -p "$WEB_ROOT"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$SITE_DIR"/ "$WEB_ROOT"/
else
  cp -a "$SITE_DIR"/. "$WEB_ROOT"/
fi
chmod -R a+rX "$WEB_ROOT"
log "站点文件就绪（共 $(find "$WEB_ROOT" -type f | wc -l) 个文件）"

# ---------------- 3. 写入 Nginx 配置 ----------------
# 移除发行版自带的默认站点，避免 default_server 冲突
rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf 2>/dev/null || true

log "写入 Nginx 配置：$CONF_PATH"
cat > "$CONF_PATH" <<EOF
# 蛙蛙新闻网 · 由 server-setup.sh 自动生成
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${DOMAIN:-_};

    root ${WEB_ROOT};
    index index.html;

    gzip on;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 入口 HTML 永不缓存，静态资源长缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    location ~* \.(js|css|png|jpg|jpeg|svg|woff2?)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# ---------------- 4. 放行防火墙 ----------------
if command -v ufw >/dev/null 2>&1; then
  log "配置 ufw：放行 22 / 80 / 443"
  ufw allow 22/tcp  >/dev/null 2>&1 || true
  ufw allow 80/tcp  >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw --force enable >/dev/null 2>&1 || true
elif command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  log "配置 firewalld：放行 ssh / http / https"
  firewall-cmd --permanent --add-service=ssh   >/dev/null
  firewall-cmd --permanent --add-service=http  >/dev/null
  firewall-cmd --permanent --add-service=https >/dev/null
  firewall-cmd --reload >/dev/null
else
  warn "未检测到 ufw / firewalld，跳过防火墙配置（请自行确认 80/443 可达）"
fi

# ---------------- 5. 启动 Nginx 并自检 ----------------
nginx -t || die "Nginx 配置校验失败，请检查 $CONF_PATH"
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx
sleep 1
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ || true)
[[ "$HTTP_CODE" == "200" ]] || die "本地自检失败（HTTP $HTTP_CODE），请查看：journalctl -u nginx -n 50"
log "本地自检通过：HTTP $HTTP_CODE ✓"

# ---------------- 6. 可选：HTTPS 证书 ----------------
if [[ -n "$DOMAIN" ]]; then
  log "为 $DOMAIN 申请 Let's Encrypt 证书 …"
  case "$PKG" in
    apt) apt-get install -y -qq certbot python3-certbot-nginx ;;
    *)   dnf install -y -q certbot python3-certbot-nginx 2>/dev/null \
           || yum install -y -q certbot python3-certbot-nginx ;;
  esac
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
          -m "${EMAIL:-admin@$DOMAIN}" --redirect \
    || die "证书申请失败：请确认域名 DNS 已解析到本机，且 80 端口公网可达"
  log "HTTPS 配置完成，已开启 HTTP → HTTPS 强制跳转 ✓"
fi

# ---------------- 7. 输出访问信息 ----------------
PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo ""
echo -e "${C_GREEN}========================================================${C_RESET}"
echo -e "${C_GREEN}  🐸 蛙蛙新闻网部署成功！${C_RESET}"
echo -e "${C_GREEN}========================================================${C_RESET}"
if [[ -n "$DOMAIN" ]]; then
  echo -e "  访问地址：${C_YELLOW}https://$DOMAIN${C_RESET}"
else
  echo -e "  访问地址：${C_YELLOW}http://$PUBLIC_IP${C_RESET}"
fi
echo "  站点目录：$WEB_ROOT"
echo "  配置文件：$CONF_PATH"
echo ""
warn "若公网仍无法访问，请检查云服务商控制台的安全组 / 防火墙规则，"
warn "确认已放行入方向 TCP 80（HTTPS 另需 443）端口。"
echo ""
