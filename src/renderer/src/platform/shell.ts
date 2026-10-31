/**
 * 运行壳判定。
 *
 * 只有 Electron 桌面端才有真正的窗口（最小化 / 最大化 / 关闭），
 * Android / iOS 的 Capacitor 壳、鸿蒙 ArkWeb 和普通浏览器都没有，
 * 界面上不能出现「Windows 金刚键」。
 */
export const IS_DESKTOP_SHELL =
  typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent)
