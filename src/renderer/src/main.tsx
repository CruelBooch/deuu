import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// 首屏先按系统偏好设置明暗，避免闪烁；应用加载设置后由 App 覆盖
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.dark = prefersDark ? 'true' : 'false'

async function bootstrap(): Promise<void> {
  // Electron 由 preload 注入 window.api；其它 WebView 壳（Android/iOS/鸿蒙 ArkWeb）在此安装适配实现
  if (!window.api) {
    const { createCapacitorApi } = await import('./platform/capacitor')
    window.api = createCapacitorApi()
  }

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

void bootstrap()
