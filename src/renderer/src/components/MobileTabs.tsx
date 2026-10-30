import type { Page } from './Sidebar'
import { IconBook, IconBookOpen, IconSearch, IconSettings } from './icons'

interface Props {
  page: Page
  onNavigate: (page: Page) => void
}

const TABS: Array<{ id: Page; label: string; icon: JSX.Element }> = [
  { id: 'search', label: '词典', icon: <IconSearch size={20} /> },
  { id: 'vocab', label: '生词本', icon: <IconBook size={20} /> },
  { id: 'study', label: '学堂', icon: <IconBookOpen size={20} /> },
  { id: 'settings', label: '设置', icon: <IconSettings size={20} /> }
]

export default function MobileTabs({ page, onNavigate }: Props): JSX.Element {
  return (
    <nav className="mobile-tabs" aria-label="导航">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`mobile-tab${page === tab.id ? ' active' : ''}`}
          type="button"
          onClick={() => onNavigate(tab.id)}
        >
          <span className="mobile-tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
