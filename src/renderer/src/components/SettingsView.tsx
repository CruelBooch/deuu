import { useEffect, useState } from 'react'
import type { AppInfo, Settings } from '../../../shared/types'
import { applyTheme, DEFAULT_ACCENT, type ThemeMode } from '../lib'
import { IconArrowLeft, IconEye, IconEyeOff } from './icons'

interface Props {
  settings: Settings
  appInfo?: AppInfo | null
  onSave: (settings: Settings) => Promise<void> | void
  onBack: () => void
}

const ACCENTS: Array<{ hex: string; name: string }> = [
  { hex: '#4a63c8', name: '墨蓝' },
  { hex: '#2f8f6b', name: '松绿' },
  { hex: '#b8513a', name: '赭红' },
  { hex: '#7a5c9e', name: '紫藤' },
  { hex: '#a8762a', name: '琥珀' },
  { hex: '#4a4a4a', name: '石墨' }
]

export default function SettingsView({
  settings,
  appInfo,
  onSave,
  onBack
}: Props): JSX.Element {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [model, setModel] = useState(settings.model)
  const [offlineFirst, setOfflineFirst] = useState(settings.offlineFirst !== false)
  const [theme, setTheme] = useState<ThemeMode>(settings.theme ?? 'auto')
  const [accent, setAccent] = useState(settings.accent || DEFAULT_ACCENT)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  // 实时预览主题；离开设置页时恢复为已保存的主题
  useEffect(() => {
    applyTheme(theme, accent)
  }, [theme, accent])

  useEffect(() => {
    return () => {
      applyTheme(settings.theme ?? 'auto', settings.accent || DEFAULT_ACCENT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(): Promise<void> {
    setSaving(true)
    setMessage(null)
    setIsError(false)
    try {
      if (!apiKey.trim()) throw new Error('请填写 API Key')
      if (!baseUrl.trim()) throw new Error('请填写接口地址')
      if (!model.trim()) throw new Error('请填写模型名称')
      await onSave({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        offlineFirst,
        theme,
        accent
      })
      setMessage('设置已保存')
      setIsError(false)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e))
      setIsError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings">
      <div className="settings-card">
        <div className="settings-head">
          <button className="back-btn" type="button" onClick={onBack} aria-label="返回" title="返回">
            <IconArrowLeft />
          </button>
          <h2 className="settings-title">设置</h2>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="apiKey">
            API Key
          </label>
          <div className="field-row">
            <input
              id="apiKey"
              className="field-input with-action"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-…"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              className="eye-btn"
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? '隐藏' : '显示'}
              title={showKey ? '隐藏' : '显示'}
            >
              {showKey ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          <span className="field-hint">仅保存在本机，不会上传到任何服务器（桌面用系统加密存储）。</span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="baseUrl">
            接口地址 · Base URL
          </label>
          <input
            id="baseUrl"
            className="field-input"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com/v1"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="model">
            模型 · Model
          </label>
          <input
            id="model"
            className="field-input"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="deepseek-chat"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <span className="field-hint">
          兼容任何 OpenAI 接口：DeepSeek / OpenAI / 通义千问 / 智谱等。只需填对地址与模型名。
        </span>

        <div className="settings-divider" />

        <div className="field">
          <label className="field-label">单字查询优先离线词典</label>
          <div className="switch-row">
            <button
              className={`switch${offlineFirst ? ' on' : ''}`}
              type="button"
              role="switch"
              aria-checked={offlineFirst}
              onClick={() => setOfflineFirst((v) => !v)}
            >
              <span className="switch-thumb" />
            </button>
            <span className="switch-label">
              开启后，单个词优先查本地词库（不请求模型、秒出结果）；未收录时自动回退 AI。
            </span>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="field">
          <span className="field-label">主题模式</span>
          <div className="segmented">
            {(
              [
                ['auto', '跟随系统'],
                ['light', '亮色'],
                ['dark', '暗色']
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`seg-item${theme === value ? ' active' : ''}`}
                onClick={() => setTheme(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">主题色</span>
          <div className="swatches">
            {ACCENTS.map((item) => (
              <button
                key={item.hex}
                type="button"
                className={`swatch${accent.toLowerCase() === item.hex.toLowerCase() ? ' active' : ''}`}
                style={{ background: item.hex }}
                title={item.name}
                aria-label={item.name}
                onClick={() => setAccent(item.hex)}
              />
            ))}
            <label className="swatch-picker" title="自定义颜色">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
              自定义
            </label>
          </div>
          <span className="field-hint">应用于按钮、链接、高亮和选中态</span>
        </div>

        <div className="settings-actions">
          <button className="btn-secondary" type="button" onClick={onBack}>
            取消
          </button>
          <button className="btn-primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>

        {message && (
          <div className={`settings-message${isError ? ' error' : ''}`}>{message}</div>
        )}

        <div className="about-card">
          <div className="about-row">
            <span className="about-name">{appInfo?.name || 'deuu'}</span>
            <span className="about-ver">v{appInfo?.version || '0.1.0'}</span>
          </div>
          <div className="about-meta">
            <span title="DeepSeek Harness">
              Made with <strong>DSH</strong>
            </span>
            <span className="about-dot">·</span>
            <span>by CruelBooch</span>
          </div>
        </div>
      </div>
    </div>
  )
}
