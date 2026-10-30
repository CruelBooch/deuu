import { App as CapApp } from '@capacitor/app'
import { CapacitorHttp } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { Api } from '../../../../shared/types'
import type { PlatformDeps } from '../types'
import { createWebviewApi } from '../webviewApi'

const DICT_URL = 'dict/de_dict.jsonl'

/** Capacitor（Android / iOS）平台能力实现 */
function capacitorDeps(): PlatformDeps {
  return {
    http: {
      // 走原生 OkHttp / NSURLSession，绕开 WebView 的 CORS 限制
      post: async (req) => {
        const res = await CapacitorHttp.post({
          url: req.url,
          headers: req.headers,
          data: req.data,
          connectTimeout: req.connectTimeout,
          readTimeout: req.readTimeout
        })
        return { status: res.status, data: res.data }
      }
    },
    storage: {
      get: async (key) => {
        const { value } = await Preferences.get({ key })
        return value ?? null
      },
      set: async (key, value) => {
        await Preferences.set({ key, value })
      }
    },
    dict: {
      load: async () => {
        const res = await fetch(DICT_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      }
    },
    info: async () => {
      try {
        const info = await CapApp.getInfo()
        return { name: info.name || 'deuu', version: info.version || '0.1.0' }
      } catch {
        return { name: 'deuu', version: '0.1.0' }
      }
    }
  }
}

export function createCapacitorApi(): Api {
  return createWebviewApi(capacitorDeps())
}
