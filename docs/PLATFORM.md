# 跨平台架构说明

deuu 的跨平台目标：**一套业务逻辑 + 一套 UI，多个壳**。

```
┌─────────────────────────────────────────────────────────┐
│ 壳（Shell）                                              │
│  Electron(main+preload) │ Capacitor(Android/iOS) │ ArkWeb │
└───────────────┬──────────────────┬──────────────────────┘
                │  注入 window.api  │
┌───────────────▼──────────────────▼──────────────────────┐
│ src/renderer         React + CSS（唯一 UI）              │
│ src/renderer/src/platform                                │
│   ├─ types.ts        平台能力契约（http/storage/dict/info）│
│   ├─ webviewApi.ts   用能力拼出完整 window.api            │
│   └─ capacitor/      Capacitor 能力实现（Android / iOS）  │
└───────────────┬─────────────────────────────────────────┘
                │  只依赖纯 TS
┌───────────────▼─────────────────────────────────────────┐
│ src/core        纯逻辑：AI 提示词/解析、词典索引          │
│                 ❗ 禁止任何 window/document/fetch/Node API │
└─────────────────────────────────────────────────────────┘
```

## 三条铁律

1. **`src/core/` 永远是纯 TS**：不出现 `window`、`document`、`fetch`、`process`、`electron`、`@capacitor/*`、`@ohos.*`。
   用 `node scripts/check-core.mjs` 校验（已接入 `pnpm check:core`）。
2. **UI 只调 `window.api.*`**，不直接碰平台 API（网络、存储、文件）。
3. **唯一 Web 交付物是 `out/renderer/`**（`electron-vite build` 的产物）。所有壳都只做两件事：加载它 + 注入 `window.api`。

## 新增一个壳要做什么

以鸿蒙 ArkWeb 为例，只有两步：

### 1. 提供平台能力

实现 `src/renderer/src/platform/types.ts` 里的四个能力：

| 能力 | 鸿蒙 ArkWeb 对应实现 |
|---|---|
| `http.post` | ArkTS `@ohos.net.http`，通过 `javaScriptProxy` 暴露给 JS |
| `storage.get/set` | `@ohos.data.preferences` |
| `dict.load` | 读取 rawfile 里的 `de_dict.jsonl` |
| `info()` | `bundleManager.getBundleInfoForSelf` |

### 2. 拼装并注入

```ts
import { createWebviewApi } from './platform/webviewApi'
window.api = createWebviewApi(harmonyDeps)
```

ArkWeb 侧用 `registerJavaScriptProxy` 把 `harmonyDeps` 的底层函数注入到 `window.__deuuNative`，
再由一小段 JS 胶水转成 `PlatformDeps` 的形状即可。

## 各平台现状

| 平台 | 壳 | 状态 |
|---|---|---|
| Windows | Electron（`frame:false` 自定义标题栏） | ✅ 已发布 |
| Android | Capacitor 6 + `platform/capacitor` | ✅ 已发布（侧载 APK） |
| iOS | Capacitor iOS | 🚧 代码可复用，需 Mac + Apple 账号 |
| macOS | Electron | 🚧 代码可复用，需 Mac 打包/签名 |
| HarmonyOS 4.x | 直接装 Android APK | ✅ 无需改动 |
| HarmonyOS NEXT | ArkWeb 壳（见上） | 📋 计划中 |

## 平台相关差异清单

| 能力 | Electron | Capacitor | ArkWeb（待接） |
|---|---|---|---|
| AI 请求 | main 进程 `fetch` | `CapacitorHttp` | `@ohos.net.http` |
| 密钥存储 | `safeStorage`(DPAPI) | `Preferences`（建议 iOS 换 Keychain） | preferences + huks |
| 词典 | `resources/dict` | `fetch('dict/de_dict.jsonl')` | rawfile |
| 窗口控制 | `window:*` IPC | 空实现 | 空实现 |
| 键盘避让 | — | Android `adjustNothing` | 由 ArkTS 侧控制 |
