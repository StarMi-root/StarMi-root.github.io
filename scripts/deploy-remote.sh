#!/usr/bin/env bash
#
# 蛙蛙新闻网 · 本地一键发布脚本（在你自己的电脑上运行）
# -------------------------------------------------------------------
# 流程：本地构建 → 上传 dist 与部署脚本 → 远程自动安装 Nginx 并上线
#
# 前置条件：
#   - 本机可用 ssh 免密（或已配置密钥）登录目标服务器
#   - 目标服务器为 Linux（Ubuntu/Debian/CentOS/RHEL/Rocky/Fedora）
#
# 用法：
#   bash scripts/deploy-remote.sh root@203.0.113.10
#   bash scripts/deploy-remote.sh root@203.0.113.10 --skip-build
#   bash scripts/deploy-remote.sh root@203.0.113.10 \
#        --domain news.example.com --email you@example.com
#
set -euo pipefail

C_GREEN="\033[32m"; C_YELLOW="\033[33m"; C_RED="\033[31m"; C_RESET="\033[0m"
log()  { echo -e "${C_GREEN}[发布]${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}[提示]${C_RESET} $*"; }
die()  { echo -e "${C_RED}[错误]${C_RESET} $*" >&2; exit 1; }

# ---------------- 参数解析 ----------------
TARGET=""
SKIP_BUILD=false
REMOTE_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build) SKIP_BUILD=true; shift ;;
    --domain|--email)
      REMOTE_ARGS+=("$1" "${2:?$1 需要一个值}"); shift 2 ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    -*) die "未知参数：$1（使用 --help 查看用法）" ;;
    *)  [[ -z "$TARGET" ]] && TARGET="$1" || die "多余参数：$1"; shift ;;
  esac
done

[[ -n "$TARGET" ]] || die "请指定目标服务器，例如：bash $0 root@203.0.113.10"

# 定位项目根目录（脚本位于 scripts/ 下）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------------- 1. 构建 ----------------
if [[ "$SKIP_BUILD" == true ]]; then
  [[ -f dist/index.html ]] || die "--skip-build 但 dist/index.html 不存在，请先构建"
  warn "跳过构建，使用现有 dist/"
else
  command -v npm >/dev/null || die "未找到 npm，无法构建（可加 --skip-build 使用已有 dist）"
  log "正在构建项目 …"
  npm run build
fi
[[ -f dist/index.html ]] || die "构建产物缺失：dist/index.html"
log "构建完成：dist/index.html（$(du -h dist/index.html | cut -f1)）"

# ---------------- 2. 上传 ----------------
REMOTE_TMP="/tmp/frognews-deploy-$$"
log "上传站点与部署脚本到 $TARGET:$REMOTE_TMP …"
ssh -o ConnectTimeout=10 "$TARGET" "mkdir -p $REMOTE_TMP" \
  || die "无法 SSH 连接 $TARGET，请检查地址、端口与密钥配置"

if command -v rsync >/dev/null 2>&1; then
  rsync -az --delete dist/ "$TARGET:$REMOTE_TMP/dist/"
else
  warn "未安装 rsync，改用 scp 传输 …"
  scp -r dist "$TARGET:$REMOTE_TMP/dist"
fi
scp scripts/server-setup.sh "$TARGET:$REMOTE_TMP/server-setup.sh"
log "上传完成 ✓"

# ---------------- 3. 远程执行部署 ----------------
log "在远程服务器执行自动化部署 …"
echo "--------------------------------------------------------"
ssh "$TARGET" "bash $REMOTE_TMP/server-setup.sh $REMOTE_TMP/dist ${REMOTE_ARGS[*]:-}"
STATUS=$?
ssh "$TARGET" "rm -rf $REMOTE_TMP" >/dev/null 2>&1 || true
[[ $STATUS -eq 0 ]] || die "远程部署失败（退出码 $STATUS）"

echo "--------------------------------------------------------"
log "🎉 发布完成！站点已在 $TARGET 上线。"
