import { app, safeStorage } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { Settings } from '../shared/types'

const DEFAULTS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  offlineFirst: true,
  theme: 'auto',
  accent: '#4a63c8'
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

interface StoredSettings {
  apiKey?: string
  apiKeyEncrypted?: string
  baseUrl?: string
  model?: string
  offlineFirst?: boolean
  theme?: 'auto' | 'light' | 'dark'
  accent?: string
}

export function loadSettings(): Settings {
  try {
    const raw = readFileSync(settingsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as StoredSettings

    let apiKey = ''
    if (parsed.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
      try {
        apiKey = safeStorage.decryptString(Buffer.from(parsed.apiKeyEncrypted, 'base64'))
      } catch {
        apiKey = ''
      }
    } else if (parsed.apiKey) {
      apiKey = parsed.apiKey
    }

    return {
      apiKey,
      baseUrl: parsed.baseUrl || DEFAULTS.baseUrl,
      model: parsed.model || DEFAULTS.model,
      offlineFirst: parsed.offlineFirst !== false,
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'auto',
      accent: /^#[0-9a-fA-F]{6}$/.test(parsed.accent || '') ? (parsed.accent as string) : DEFAULTS.accent
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: Settings): void {
  const stored: StoredSettings = {
    baseUrl: settings.baseUrl,
    model: settings.model,
    offlineFirst: settings.offlineFirst !== false,
    theme: settings.theme === 'light' || settings.theme === 'dark' ? settings.theme : 'auto',
    accent: /^#[0-9a-fA-F]{6}$/.test(settings.accent || '') ? settings.accent : DEFAULTS.accent
  }

  if (settings.apiKey && safeStorage.isEncryptionAvailable()) {
    stored.apiKeyEncrypted = safeStorage.encryptString(settings.apiKey).toString('base64')
  } else {
    stored.apiKey = settings.apiKey
  }

  const p = settingsPath()
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(stored, null, 2), 'utf-8')
}
