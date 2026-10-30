import { useEffect, useRef, useState } from 'react'
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

/** 接口地址与模型的默认值：默认锁定，改动需二次确认 */
const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1'
const DEFAULT_MODEL = 'deepseek-chat'

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
  const [unlocked, setUnlocked] = useState(false)
  const [askUnlock, setAskUnlock] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const savedRef = useRef(settings)
  savedRef.current = settings

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

  // 修改即保存：不再需要"保存"按钮，防抖 500ms 落盘
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = {
        ...savedRef.current,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
        model: model.trim() || DEFAULT_MODEL,
        offlineFirst,
        theme,
        accent
      }
      void Promise.resolve(onSave(next)).catch(() => undefined)
      setMessage('已自动保存')
      setTimeout(() => setMessage(null), 1400)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, baseUrl, model, offlineFirst, theme, accent])

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
          <div className="field-label-row">
            <label className="field-label" htmlFor="baseUrl">
              接口地址 · Base URL
            </label>
            <button
              className="field-lock-btn"
              type="button"
              onClick={() => {
                if (unlocked) setUnlocked(false)
                else setAskUnlock(true)
              }}
            >
              {unlocked ? '锁定' : '修改'}
            </button>
          </div>
          <input
            id="baseUrl"
            className="field-input"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={DEFAULT_BASE_URL}
            autoComplete="off"
            spellCheck={false}
            disabled={!unlocked}
          />
        </div>

        <div className="field">
          <div className="field-label-row">
            <label className="field-label" htmlFor="model">
              模型 · Model
            </label>
            <button
              className="field-lock-btn"
              type="button"
              onClick={() => {
                if (unlocked) setUnlocked(false)
                else setAskUnlock(true)
              }}
            >
              {unlocked ? '锁定' : '修改'}
            </button>
          </div>
          <input
            id="model"
            className="field-input"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={DEFAULT_MODEL}
            autoComplete="off"
            spellCheck={false}
            disabled={!unlocked}
          />
        </div>

        {askUnlock && (
          <div className="unlock-warn">
            接口地址和模型一般不需要改。填错会导致所有 AI 功能失效，出现「模型不存在」或「连接失败」之类的错误。
            <div className="unlock-warn-actions">
              <button type="button" onClick={() => setAskUnlock(false)}>
                算了
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setAskUnlock(false)
                  setUnlocked(true)
                }}
              >
                我确定，解锁
              </button>
            </div>
          </div>
        )}

        {unlocked ? (
          <div className="lock-hint-row">
            <span className="field-hint">已解锁，修改后自动保存。</span>
            <button
              className="lock-reset-btn"
              type="button"
              onClick={() => {
                setBaseUrl(DEFAULT_BASE_URL)
                setModel(DEFAULT_MODEL)
              }}
            >
              恢复默认
            </button>
          </div>
        ) : (
          <span className="field-hint">
            默认锁定。兼容任何 OpenAI 接口：DeepSeek / OpenAI / 通义千问 / 智谱等。
          </span>
        )}

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

        <div className="settings-autosave">
          {message ? <span className="settings-saved">{message}</span> : <span className="settings-saved-idle">修改会自动保存</span>}
        </div>

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
