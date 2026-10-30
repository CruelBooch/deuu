import { useEffect, useState } from 'react'
import appIcon from '../assets/app-icon.png'
import {
  IconClose,
  IconHistory,
  IconMaximize,
  IconMinimize,
  IconRestore
} from './icons'

interface Props {
  historyOpen: boolean
  onToggleHistory: () => void
  onHome: () => void
}

export default function TitleBar({ historyOpen, onToggleHistory, onHome }: Props): JSX.Element {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.api
      .windowIsMaximized()
      .then(setMaximized)
      .catch(() => setMaximized(false))
  }, [])

  async function toggleMaximize(): Promise<void> {
    try {
      const next = await window.api.windowToggleMaximize()
      setMaximized(next)
    } catch {
      /* 忽略 */
    }
  }

  return (
    <header className="titlebar">
      <div className="titlebar-left">
        <button className="brand" type="button" onClick={onHome} title="回到首页">
          <img className="brand-mark" src={appIcon} alt="" aria-hidden="true" />
          deuu
        </button>
      </div>

      <div className="titlebar-actions">
        <button
          className={`titlebar-btn${historyOpen ? ' on' : ''}`}
          type="button"
          onClick={onToggleHistory}
          title={historyOpen ? '收起历史记录' : '展开历史记录'}
          aria-label={historyOpen ? '收起历史记录' : '展开历史记录'}
          aria-pressed={historyOpen}
        >
          <IconHistory size={16} />
        </button>
        <span className="titlebar-sep" aria-hidden="true" />
        <button
          className="titlebar-btn"
          type="button"
          onClick={() => window.api.windowMinimize()}
          title="最小化"
          aria-label="最小化"
        >
          <IconMinimize />
        </button>
        <button
          className="titlebar-btn"
          type="button"
          onClick={toggleMaximize}
          title={maximized ? '还原' : '最大化'}
          aria-label={maximized ? '还原' : '最大化'}
        >
          {maximized ? <IconRestore /> : <IconMaximize />}
        </button>
        <button
          className="titlebar-btn close"
          type="button"
          onClick={() => window.api.windowClose()}
          title="关闭"
          aria-label="关闭"
        >
          <IconClose />
        </button>
      </div>
    </header>
  )
}
