# Gesture Universe — VS Code 完整项目

一个原生 HTML / CSS / JavaScript 的互动网页项目，适合在 VS Code 中学习、修改与部署。

## 文件结构

```text
Gesture-Universe-Full/
├── index.html      # 页面结构、文案和组件
├── style.css       # 视觉系统、响应式布局和动画
├── script.js       # 粒子引擎、鼠标交互、摄像头手势识别
└── README.md       # 项目说明
```

## 在 VS Code 中运行

1. 解压项目 ZIP。
2. VS Code → 文件 → 打开文件夹 → 选择 `Gesture-Universe-Full`。
3. 在扩展中搜索并安装 **Live Server**。
4. 在左侧文件栏右键 `index.html` → **Open with Live Server**。
5. 浏览器打开后，可以先移动鼠标查看粒子互动。

## 摄像头手势

在互动区域点击“开启摄像头”，并在浏览器提示时允许摄像头权限。支持的基础动作：
- 张开手掌：触发扩散感的粒子反馈。
- 拇指与食指捏合：粒子聚焦反馈。
- 移动手掌：控制互动焦点。

手势识别通过 MediaPipe Hands CDN 加载，所以需要网络连接。摄像头权限一般要求 HTTPS 或 localhost；请通过 Live Server 启动，不要直接双击 HTML 文件。

## 如何修改

- 改文字、按钮和页面结构：`index.html`
- 改颜色、字体、间距、响应式：`style.css` 的 `:root` 和对应组件样式
- 改粒子数量、手势阈值和交互：`script.js`
  - 粒子数量：搜索 `Math.min(260`
  - 捏合阈值：搜索 `pinchDistance < .075`
  - 手势识别置信度：搜索 `minDetectionConfidence`

## 常见问题

**摄像头按钮没有反应 / 识别库未加载**
- 确认网络可访问 jsDelivr CDN。
- 使用最新版 Chrome 或 Edge。
- 使用 Live Server 访问 `localhost`。
- 在浏览器地址栏左侧的站点权限中允许摄像头。

**看不到粒子**
- 刷新页面，确认浏览器控制台没有报错。
- 不要用文件管理器直接打开 `index.html`；优先通过 Live Server 运行。

## 部署到 Cloudflare Pages

本项目是静态网站，无需构建步骤。将这四个文件放到 Git 仓库根目录，Cloudflare Pages 选择该仓库，Build command 留空，Build output directory 设为 `/`（根目录）。部署后使用 HTTPS，便于浏览器摄像头权限工作。

## 说明

此版本是完整的前端演示项目，不包含服务端、用户账户或数据存储。摄像头图像在浏览器中交给前端 MediaPipe 进行识别；请在可信设备上使用并在结束后关闭摄像头。
