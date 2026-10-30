import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

interface DeuuNative {
  statusBarDp?: () => number
  navigationBarDp?: () => number
}

declare global {
  interface Window {
    DeuuNative?: DeuuNative
  }
}

const native = Capacitor.isNativePlatform()

/** 读取原生桥接暴露的系统栏尺寸（单位 dp = CSS px），失败返回 0 */
function nativeInset(name: 'statusBarDp' | 'navigationBarDp'): number {
  try {
    const fn = window.DeuuNative?.[name]
    const v = typeof fn === 'function' ? fn() : 0
    return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0
  } catch {
    return 0
  }
}

/**
 * 让界面延伸到状态栏下方：
 * 1. WebView 覆盖状态栏，状态栏透明
 * 2. 把系统栏高度写进 CSS 变量，供布局留白
 */
export async function initStatusBar(): Promise<void> {
  if (!native) return

  try {
    await StatusBar.setOverlaysWebView({ overlay: true })
    await StatusBar.setBackgroundColor({ color: '#00000000' })
  } catch {
    /* 老系统可能不支持，忽略 */
  }

  // 原生桥接可能稍晚注入，最多等 2 秒
  for (let i = 0; i < 20; i += 1) {
    const top = nativeInset('statusBarDp')
    if (top > 0) {
      document.documentElement.style.setProperty('--status-h', `${top}px`)
      break
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  const bottom = nativeInset('navigationBarDp')
  if (bottom > 0) {
    document.documentElement.style.setProperty('--nav-h', `${bottom}px`)
  }
}

/** 根据当前明暗主题切换状态栏图标颜色 */
export async function syncStatusBarStyle(): Promise<void> {
  if (!native) return
  const dark = document.documentElement.dataset.dark === 'true'
  try {
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: '#00000000' })
  } catch {
    /* 忽略 */
  }
}
