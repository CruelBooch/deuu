# deuu · Android 方案设计

> 目标：把现有 Electron 桌面版 deuu 带到 Android，最大化复用已有 TypeScript/React 资产。
> 状态：设计稿（未实施）。

## 1. 结论先行

**推荐路线：Capacitor 6 + 复用现有 React 渲染层 + 抽出平台无关的 core 层。**

一句话架构：**现状代码里 `window.api` 的接口形状，就是天然的跨平台适配层契约**；把 main 进程里的业务逻辑抽到 `core/`，两端各自实现"平台适配器"，UI 与 core 双端共享。

### 为什么不选其它方案

| 方案 | 结论 | 原因 |
|---|---|---|
| React Native | ❌ | UI 要整套重写成 RN 组件；现有 CSS 设计体系全丢，收益低 |
| Flutter | ❌ | Dart 全重写，等于新项目 |
| Tauri 2 | ❌（暂缓） | Android 支持仍早期，插件生态薄，构建链更复杂 |
| PWA | 可选附加 | 最省事，但离线资源/密钥存储/上架体验弱，不能替代原生壳 |
| **Capacitor** | ✅ | WebView 里跑现有 React，插件补原生能力，改造量最小 |

## 2. 现状盘点

桌面端三层：

```
src/main/      Node 环境：窗口、IPC、AI 请求、词典、设置(DPAPI)、历史、生词本、文件 IO
src/preload/   contextBridge 暴露 window.api
src/renderer/  React + CSS（三栏布局）
```

**可复用**：`src/renderer` 全部 UI、`src/shared/types.ts` 全部类型。
**必须重写**：`src/main` 的所有平台相关实现（Node API → Android API）。

## 3. 目标架构

```
src/
├─ core/                 ← 新增：纯 TS，不依赖 Node/Electron/Android
│  ├─ types.ts              共享类型（现 shared/types.ts）
│  ├─ ai.ts                 提示词、请求体构造、响应 JSON 解析/降级
│  ├─ dictionary.ts         索引构建、查询、前缀候选（数据无关）
│  ├─ history.ts            历史模型（增删、分组、上限）
│  ├─ vocab.ts              生词本模型（分组/排序/批量）
│  └─ summarize.ts          历史摘要
├─ platform/
│  ├─ electron/          现 src/main 改造：文件 IO、safeStorage、fetch
│  └─ android/           Capacitor 插件适配层
├─ preload/              Electron 专用
└─ renderer/             共享 UI（响应式改造）
```

契约不变：UI 只调 `window.api.*`；Electron 用 preload 实现，Android 用 Capacitor 插件实现。

## 4. 关键技术决策

### 4.1 网络请求（CORS 是最大坑）

- 桌面：主进程 `fetch`，无 CORS。
- Android：WebView 里直接 `fetch('https://api.deepseek.com')` 会被 CORS 拦死。
- **方案**：抽象 `http.postJSON(url, headers, body)`：
  - Electron → Node `fetch`
  - Android → `@capacitor/http`（原生 OkHttp，不受 CORS 约束）
- 备选：WebView 关闭 web security（❌ 不安全，不采用）。

### 4.2 API Key 存储

- 桌面：`safeStorage`（DPAPI）。
- Android：**Android Keystore**，用 `capacitor-secure-storage-plugin`（底层 EncryptedSharedPreferences）或自写插件。
- 底线：绝不落明文 SharedPreferences / localStorage。

### 4.3 离线词典

数据：`de_dict.jsonl`，2.09 MB / 19,080 词。

| 方案 | 启动 | 内存 | 结论 |
|---|---|---|---|
| A. 随包 assets + 内存 Map（复用桌面代码） | 约 300–500ms | 20–30 MB | **v1 采用** |
| B. 预生成 SQLite + 索引 | 近 0 | 几 MB | 词库再变大/低端机再上 |

v1 落地方式：`assets/dict/de_dict.jsonl` → 首启拷到 `filesDir` → 复用 `core/dictionary.ts`。
APK 体积 +2MB，可接受。

### 4.4 本地数据

- 历史 / 生词本：桌面是 JSON 文件。
- Android：`@capacitor/preferences`（SharedPreferences）足够（几十 KB 量级）。
- 阈值：若生词本 > ~2000 条或需要复杂查询，再迁 SQLite。

### 4.5 UI 适配（桌面三栏 → 手机）

| 桌面 | 手机 |
|---|---|
| 左侧导航栏 | **底部 Tab**：词典 / 生词本 / 设置 |
| 右侧历史面板 | 词典页内「历史」按钮 → 底部弹层 / 抽屉 |
| 自定义标题栏 + 窗口按钮 | 系统状态栏（`@capacitor/status-bar` 设置配色） |
| hover 才显示的删除按钮 | 常显或长按菜单 |
| 三栏并排 | 单栏纵向；≥600dp（平板/横屏）恢复双栏（列表+详情） |

细节：
- 安全区：`padding: env(safe-area-inset-*)`
- 键盘：`android:windowSoftInputMode="adjustResize"`
- 返回键：`@capacitor/app` 的 `backButton` → 有弹层先关弹层，否则退出
- 字体/字号、点击区域 ≥ 44dp

### 4.6 平台能力对照

| 能力 | 桌面（Electron） | Android（Capacitor） |
|---|---|---|
| AI 请求 | main `fetch` | `@capacitor/http` |
| 密钥 | `safeStorage` | Keystore / EncryptedSharedPreferences |
| 词典文件 | `resources/dict` | `assets/` → `filesDir` |
| 历史/生词本 | JSON 文件 | Preferences（或 SQLite） |
| 剪贴板 | `navigator.clipboard` | `@capacitor/clipboard`（也可直接用 navigator.clipboard） |
| 窗口控制 | `window:*` IPC | 无 |
| 分享 | 无 | 可选 `@capacitor/share`（分享译文/生词） |

## 5. 分阶段计划

| 阶段 | 内容 | 产出 | 预估 |
|---|---|---|---|
| **M0** | 抽 `core/`，桌面端改造成调用 core | 桌面功能零回归（回归验证：查词/翻译/历史/生词本） | 1–2 天 |
| **M1** | Capacitor 骨架 + 复用 UI + 设置页 + AI 请求（HTTP 插件） | Android 能查词/翻译（在线） | 2–3 天 |
| **M2** | 离线词典接入（assets 拷贝 + 索引） | 单词离线秒查 + 候选 | 1 天 |
| **M3** | 历史 + 生词本（Preferences 持久化） | 与桌面功能对齐 | 1–2 天 |
| **M4** | 移动端 UI：底部 Tab、历史弹层、安全区、返回键、平板双栏 | 可用性达标 | 2–3 天 |
| **M5** | Keystore 密钥存储 + 签名 + 打包 APK/AAB + 真机测试 | 可分发安装包 | 1 天 |
| **M6** | 可选：PWA 产物、分享、深色模式细节 | 增强 | — |

## 6. 本机构建前置条件（当前不具备）

| 项 | 现状 | 需要 |
|---|---|---|
| JDK | 只有 Java 8 | **JDK 17**（Temurin），APG 8.x 强制要求 |
| Android SDK | 未安装 | cmdline-tools + platform-34 + build-tools 34（约 700MB） |
| Gradle | 未安装 | Capacitor 工程的 Gradle Wrapper 自动下载 |
| Android Studio | 未安装 | 可选，装了最省事 |
| 网络 | — | dl.google.com / services.gradle.org 可能受限，需镜像 |

三条路：
1. 本机装 JDK 17 + command-line SDK（可脚本化，但下载可能被墙）
2. 装 Android Studio（一次到位，含 SDK）
3. 换一台已配好 SDK 的机器 / CI 出包（推荐用于正式发布）

## 7. 风险与取舍

1. **CORS**：必须走原生 HTTP，否则 Android 上 AI 功能全废。
2. **词典内存**：低端机 20–30MB，可接受；必要时切 SQLite。
3. **UI 分叉**：坚持"一套响应式 UI"，禁止维护两套布局。
4. **上架政策**：用户自填 API Key 的 AI 应用，Google Play 对内容与"AI 生成内容"有额外要求；若不想折腾，先只发 APK 侧载。
5. **签名**：Android 必须签名（自签名即可），keystore 要妥善保管，否则无法覆盖升级。
6. **桌面回归**：M0 抽 core 是唯一高风险改动，必须先跑通桌面再动 Android。

## 8. 需要拍板的三个问题

1. **分发方式**：只发 APK 侧载 / 还是上 Google Play（影响签名、隐私政策、包体拆分）？
2. **UI 形态**：接受「底部 3 Tab + 历史弹层」，还是希望历史也独立成第 4 个 Tab？
3. **构建环境**：本机装 JDK17+SDK（我来脚本化），还是你那边用 Android Studio 出包？

## 9. 建议的第一步

先做 **M0（抽 core）+ M1（Capacitor 骨架）**，用最小成本验证「同一套 UI + 同一套 core 能在 Android 跑通」；跑通后再决定词典用 JSONL 还是 SQLite、以及是否做平板布局。
