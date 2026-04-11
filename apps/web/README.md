# chaoxing-sign-web

当前前端已重构为基于 React + Vite + TailwindCSS 的产品化面板，只改 `apps/web`，不改后端业务逻辑。

## 命令

- `corepack pnpm@10.11.0 install`：安装依赖
- `corepack pnpm@10.11.0 dev`：启动 Web 开发服务器
- `corepack pnpm@10.11.0 build`：构建静态页面，输出到 `dist`

## 环境变量

复制 `apps/web/.env.example`，按部署环境填写：

```env
VITE_API_BASE_URL=http://your-server-host:5000
VITE_AMAP_KEY=your-amap-js-api-key
```

- `VITE_API_BASE_URL`：后端 API 地址，必填
- `VITE_AMAP_KEY`：高德地图 JS API Key，可选。启用地图选点时需要

## 当前页面

- 登录页
- Dashboard
- 课程 / 签到列表页
- 日志页
- 设置页

## 关键目录

```txt
src/
├── components/
├── context/
├── hooks/
├── pages/
├── services/
├── styles/
```

说明：

- `services/api.ts`：统一请求封装
- `context/AppContext.tsx`：登录态、任务态、日志态的统一管理
- `services/storage.ts`：`localStorage` 读写和日志脱敏
- `components/MapPickerModal.tsx`：地图选点弹层

## 当前能力

### 登录

输入手机号和密码后调用 `/login`，成功后会将会话保存到 `localStorage`。

### 立即签到

根据当前签到类型自动切换前端交互：

- 普通签到：直接提交
- 拍照签到：前端上传图片后调用 `/upload` + `/photo`
- 二维码签到：支持手动输入 `enc` 或上传二维码图片自动解析
- 位置签到：支持手动填写，也支持地图选点

### 日志

日志页仅展示清洗后的业务日志：

- 不记录密码
- 手机号自动脱敏
- 不展示后端原始技术输出

### 设置

设置页可修改：

- 手机号
- 密码
- 位置签到默认地址
- 经纬度
- 地图选点结果

## 地图选点

地图选点依赖高德 JS API。

启用方式：

1. 申请高德 JS API Key
2. 配置 `VITE_AMAP_KEY`
3. 重新构建前端

可用入口：

- 设置页
- Dashboard 中的位置签到 / 二维码签到表单

## 注意

- 当前课程列表页基于“当前活动 + 本地沉淀的历史记录”生成，因为后端没有提供独立课程列表接口
- 如果你部署在反向代理后面，请确保 `VITE_API_BASE_URL` 指向正确的 API 地址
- 如果不需要地图选点，可以不配置 `VITE_AMAP_KEY`
