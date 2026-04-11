<h1 align="center">🌿超星学习通签到🌿</h1>

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Licence](https://img.shields.io/github/license/cxOrz/chaoxing-signin?style=for-the-badge)

基于 Node.js 实现的一个超星学习通签到项目，包含命令行模式和 Web 面板。当前 Web 端基于 React + Vite + TailwindCSS，后端 API 基于 Koa。

**功能**：普通签到、拍照签到、手势签到、位置签到、签到码签到、二维码签到；支持 Web 登录、Dashboard、课程状态列表、日志页、设置页、地图选点。

## 环境 💻

可在任意运行 [NodeJS](https://nodejs.org/en/) > v18.14 的平台签到，Windows、macOS、Linux 均可。

安卓手机上可以用 Termux 来运行 Node.js 程序，[查看 Termux 教程](./apps/server/src/docs/termux.md)。

苹果手机请查看 [高级](#高级-) 部分，通过 Web 部署方式访问即可。

## 部署 🛠

将仓库克隆到本地：

```bash
git clone https://github.com/cxOrz/chaoxing-signin.git
```

进入项目文件夹并安装依赖：

```bash
cd chaoxing-signin
corepack pnpm@10.11.0 install
```

### 环境变量

Web 前端使用 Vite 环境变量，不再写死 `localhost`。

`apps/web/.env.example`

```env
VITE_API_BASE_URL=http://your-server-host:5000
VITE_AMAP_KEY=your-amap-js-api-key
```

- `VITE_API_BASE_URL`：Web 前端访问后端 API 的地址
- `VITE_AMAP_KEY`：高德地图 JS API Key，只有在你希望使用地图选点时才需要配置

## 运行 ⚙

### 命令解释

根目录下：
- `corepack pnpm@10.11.0 dev`：运行 Web 开发服务器和后端接口
- `corepack pnpm@10.11.0 build`：构建前端页面并转译后端代码
- `corepack pnpm@10.11.0 start`：运行手动签到
- `corepack pnpm@10.11.0 serve`：启动后端接口
- `corepack pnpm@10.11.0 monitor`：启动监听模式，检测到签到将自动签上，无需人工干预

`apps/server` 目录下：
- `corepack pnpm@10.11.0 build`：转译代码
- `corepack pnpm@10.11.0 start`：运行手动签到功能，若有签到则手动完成，若无则退出程序
- `corepack pnpm@10.11.0 serve`：启动接口
- `corepack pnpm@10.11.0 monitor`：启动监听模式，检测到签到将自动签上，无需人工干预

`apps/web` 目录下：
- `corepack pnpm@10.11.0 dev`：运行 Web 开发服务器
- `corepack pnpm@10.11.0 build`：构建静态页面

### 基本使用方式

进入 `apps/server` 目录下，执行以下步骤：

构建代码：

```bash
corepack pnpm@10.11.0 build
```

构建完成后，后续运行直至下次变更代码，不需要再构建，可以直接运行：

```bash
corepack pnpm@10.11.0 start
```

### Web 面板使用

当前 `apps/web` 已重构为产品化面板，包含以下页面：

- 登录页：手机号、密码、登录状态提示
- Dashboard：当前账号、最近签到状态、可签到任务、立即签到
- 课程 / 签到列表页：展示当前任务和本地沉淀的历史状态
- 日志页：仅展示清洗后的业务日志，不记录密码，手机号脱敏
- 设置页：保存账号信息、位置参数、地图选点

Web 端登录信息保存在浏览器 `localStorage` 中，不再使用旧版 IndexedDB 页面结构。

## 使用须知 📄

为了节约资源，只对 2 小时以内的活动签到。若同时有多个有效签到活动，只签最新发布的。将结束的课程移入其他文件夹，减少根目录的课程能够提高活动检测速度。

### 二维码签到

CLI 模式下，可以先识别二维码得到 `enc` 参数后再填入。

Web 模式下，支持：

- 手动粘贴 `enc`
- 上传二维码图片自动解析得到 `enc`

如果遇到 10 秒变换的二维码，参考 [#178](https://github.com/cxOrz/chaoxing-signin/issues/178)。

### 位置签到

CLI 模式下，仍然可以手动输入**经纬度**和**详细地址**。

Web 模式下，除了手动填写，也可以在设置页和签到面板中直接使用地图选点，自动回填：

- `lon`
- `lat`
- `address`

如果你只使用 Web 面板，建议配置 `VITE_AMAP_KEY` 后直接用地图选点，不必再手动查坐标。

### 拍照签到

CLI 模式下，需要事先准备一张照片并上传到超星云盘。

Web 模式下，不需要手动上传云盘，可以直接在前端选择图片，页面会自动调用后端已有的 `/uvtoken`、`/upload`、`/photo` 接口完成签到。

### 普通签到 / 手势签到 / 签到码签到

没有需要准备的，直接运行即可。

### 监听模式

支持开启 QQ 机器人、邮件推送、pushplus 推送。

**QQ 机器人**：根据 [go-cqhttp](https://docs.go-cqhttp.org/guide/quick_start.html) 文档，配置正向 WebSocket、QQ 号、密码，并运行 go-cqhttp 程序，即可运行监听模式并启用该选项。

如需发送二维码让机器人识别并签到，请配置 `env.json` 的 `SecretId` 和 `SecretKey`，将使用腾讯云 OCR 进行识别和处理。

监听模式每次需要时启用 2 - 4 小时较为合适，最好不要长期挂着不关。

## Web 前端说明

`apps/web` 当前目录结构：

```txt
apps/web/src/
├── components/
├── context/
├── hooks/
├── pages/
├── services/
├── styles/
```

关键实现：

- 统一 API 封装：`apps/web/src/services/api.ts`
- 全局状态：`apps/web/src/context/AppContext.tsx`
- 本地存储：`apps/web/src/services/storage.ts`
- 地图选点：`apps/web/src/components/MapPickerModal.tsx`

注意事项：

- 前端 API 地址必须通过 `VITE_API_BASE_URL` 提供
- 日志页不会展示密码，手机号会脱敏
- 课程页依赖后端返回的当前活动和前端本地沉淀的历史记录，因为当前后端没有独立课程列表接口

## 高级 🎲

除了简单的 `corepack pnpm@10.11.0 start` 来手动签到，也可以部署到服务器使用网页版本，这也是完整的 Web 项目。

- 前端界面，查看 [前端](/apps/web) 的详细说明
- 后端服务，查看 [服务端](/apps/server) 的详细说明

### 一键运行

方案一：根目录下执行 `corepack pnpm@10.11.0 dev`，将运行前后端服务，并在浏览器弹出项目首页，注意这是开发模式。

方案二：用 Docker 构建并运行，运行后可通过 IP 或反向代理域名访问。

```bash
docker build -t chaoxing-signinn .
docker run -d -p 80:80 -p 5000:5000 chaoxing-signinn
```

如果你需要地图选点，构建前请确保 `apps/web` 可读取到 `VITE_AMAP_KEY`。若你通过 CI 或 Docker 构建，建议在构建阶段注入该变量。

> 出现问题？先仔细阅读相关说明，若仍无法解决请发 issue

### 展示

![](https://service-m9r7liw5-1252446325.bj.apigw.tencentcs.com/release/ui-start.png)
![](https://service-m9r7liw5-1252446325.bj.apigw.tencentcs.com/release/ui-config.webp)

## 贡献须知

> 由于作者精力有限，自 2023.6.10 起，本项目不再维护，欢迎热心同学们贡献代码。

发起 PR 之前务必先发起 issue 进行讨论，之后新建一个分支（以提供的功能命名），并在此分支完成你的代码即可提交 PR。

必要条件：
- 运行 lint 无错误出现，可以有警告
- 测试所有功能全部正常

## 免责声明

本项目仅作为交流学习使用，通过本项目加深网络通信、接口编写、交互设计等方面知识的理解，请勿用作商业用途，任何人或组织使用项目中代码进行的任何违法行为与本人无关。
