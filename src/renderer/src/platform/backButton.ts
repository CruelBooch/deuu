import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

const native = Capacitor.isNativePlatform()

/** 拦截安卓物理返回键 / 系统返回手势，返回取消函数 */
export function onHardwareBack(handler: () => void): () => void {
  if (!native) return () => {}
  let remove: (() => void) | undefined
  void App.addListener('backButton', () => handler()).then((listener) => {
    remove = () => {
      void listener.remove()
    }
  })
  return () => {
    remove?.()
  }
}

/** 没有可返回的层级时切到后台，而不是直接杀掉应用 */
export function minimizeApp(): void {
  if (!native) return
  void App.minimizeApp().catch(() => undefined)
}
