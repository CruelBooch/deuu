import {
  IconBook,
  IconBookOpen,
  IconChevronLeft,
  IconChevronRight,
  IconPage,
  IconSearch,
  IconSettings
} from './icons'

export type Page = 'search' | 'vocab' | 'grammar' | 'reading' | 'settings'

interface Props {
  page: Page
  onNavigate: (page: Page) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  id: Page
  label: string
  icon: JSX.Element
}

const TOP_ITEMS: NavItem[] = [
  { id: 'search', label: '词典 · 翻译', icon: <IconSearch /> },
  { id: 'vocab', label: '生词本', icon: <IconBook /> },
  { id: 'grammar', label: '语法', icon: <IconBookOpen /> },
  { id: 'reading', label: '阅读', icon: <IconPage /> }
]

export default function Sidebar({
  page,
  onNavigate,
  collapsed,
  onToggleCollapse
}: Props): JSX.Element {
  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`} aria-label="导航">
      <button
        className="sidebar-toggle"
        type="button"
        onClick={onToggleCollapse}
        title={collapsed ? '展开导航' : '收起导航'}
        aria-label={collapsed ? '展开导航' : '收起导航'}
      >
        {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
      </button>

      {TOP_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item${page === item.id ? ' active' : ''}`}
          type="button"
          onClick={() => onNavigate(item.id)}
          title={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}

      <div className="sidebar-grow" />

      <button
        className={`nav-item${page === 'settings' ? ' active' : ''}`}
        type="button"
        onClick={() => onNavigate('settings')}
        title="设置"
      >
        <span className="nav-icon">
          <IconSettings />
        </span>
        <span className="nav-label">设置</span>
      </button>
    </nav>
  )
}
