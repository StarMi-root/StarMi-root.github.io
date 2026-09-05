# 蛙蛙新闻网 · 部署说明

站点构建产物是一个**自包含的单文件** `dist/index.html`（JS/CSS 已全部内联），
任何静态 Web 服务器都能直接托管。以下脚本帮你在一台全新 Linux 服务器上全自动完成上线。

## 方案一：本地一键发布（推荐）

在你自己的电脑上运行，自动完成「构建 → 上传 → 远程安装 Nginx → 放行防火墙 → 自检」：

```bash
# 仅 IP 访问（HTTP）
bash scripts/deploy-remote.sh root@你的服务器IP

# 已有 dist、不想重新构建
bash scripts/deploy-remote.sh root@你的服务器IP --skip-build

# 绑定域名并自动申请 HTTPS 证书（需域名已解析到该服务器）
bash scripts/deploy-remote.sh root@你的服务器IP \
     --domain news.example.com --email you@example.com
```

前置条件：

- 本机可以 `ssh root@服务器IP` 登录（密钥认证，首次会提示确认指纹）
- 服务器为 Ubuntu / Debian / CentOS / RHEL / Rocky / AlmaLinux / Fedora

## 方案二：在服务器上直接运行

先把 `dist/` 目录和脚本传到服务器（scp / U 盘均可），然后在服务器上执行：

```bash
sudo bash server-setup.sh ./dist
sudo bash server-setup.sh ./dist --domain news.example.com --email you@example.com
```

## 脚本做了什么

1. 识别发行版，用 apt / dnf / yum 安装 Nginx
2. 站点部署到 `/var/www/frognews`（增量同步，重复执行即更新）
3. 写入 `/etc/nginx/conf.d/frognews.conf`（gzip、SPA 回退、HTML 不缓存）
4. 放行防火墙 22 / 80 / 443（自动适配 ufw / firewalld）
5. `--domain` 时用 certbot 自动申请 Let's Encrypt 证书并强制 HTTPS 跳转
6. 本地自检 HTTP 200 后，打印公网访问地址

重复运行是**幂等**的：更新文章后再次执行同一条命令即可完成升级。

## 常见问题

- **公网打不开**：绝大多数情况是云服务商（阿里云 / 腾讯云 / AWS / Vultr…）
  控制台的**安全组**没有放行入方向 TCP 80（HTTPS 需 443）。脚本只能管理系统内防火墙，
  安全组需在云控制台手动放行。
- **证书申请失败**：确认域名 DNS 的 A 记录已指向服务器公网 IP，且 80 端口公网可达
  （部分机房对未备案域名会拦截 80 端口，可先用 IP 访问验证）。
- **SSH 连不上**：确认使用密钥登录（`ssh-copy-id root@IP`），或改用 `-p 端口`
  形式的自定义端口（可在脚本的 ssh 命令中追加 `-p 2222`）。
- **端口被占用**：若 80 端口已被 Apache 等占用，先 `systemctl stop apache2 && systemctl disable apache2`。

## 更新站点

在本地改完内容后，重新执行方案一的命令即可（默认会先 `npm run build`）。
