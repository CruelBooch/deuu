import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.cruelbooch.deuu',
  appName: 'deuu',
  webDir: 'out/renderer',
  android: {
    allowMixedContent: false
  },
  plugins: {
    // 走原生 OkHttp，绕开 WebView 的 CORS 限制
    CapacitorHttp: {
      enabled: true
    }
  }
}

export default config
