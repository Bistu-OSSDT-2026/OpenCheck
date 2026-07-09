/**
 * PageLayout —— R3（倪子宸）所有
 *
 * 全站外壳：Stitch 风格全宽顶栏 + 内容容器 + 页脚。
 */

import type { ReactNode } from 'react'
import { ArrowLeft, ExternalLink, FileText, History, Home, KeyRound, SquareTerminal } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTE } from '@/router/routes'

export interface PageLayoutProps {
  /** 页面标题（显示在内容区标题栏；首页自己渲染 Hero 标题） */
  title: string
  /** 页面内容 */
  children: ReactNode
  /** 是否显示返回按钮和内容区标题（首页不显示，默认 true） */
  showBack?: boolean
}

export function PageLayout({ title, children, showBack = true }: PageLayoutProps) {
  const navigate = useNavigate()
  const navItems = [
    { label: '主页', route: ROUTE.HOME, Icon: Home },
    { label: '历史记录', route: ROUTE.HISTORY, Icon: History },
    { label: 'Token 配置', route: ROUTE.TOKEN, Icon: KeyRound },
  ]

  return (
    <div className="page-shell">
      <header className="page-layout__nav">
        <div className="page-layout__nav-inner">
          <Link className="page-layout__logo" to={ROUTE.HOME} aria-label="OpenCheck 首页">
            <SquareTerminal aria-hidden="true" size={24} strokeWidth={2.4} />
            <span>OpenCheck</span>
          </Link>
          <nav className="page-layout__links" aria-label="主导航">
            {navItems.map(({ label, route, Icon }) => (
              <NavLink
                key={route}
                className={({ isActive }) =>
                  `page-layout__link${isActive ? ' page-layout__link--active' : ''}`
                }
                to={route}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={`page-layout__main${showBack ? '' : ' page-layout__main--home'}`}>
        {showBack && (
          <div className="page-layout__page-heading">
            <button className="page-layout__back" type="button" onClick={() => navigate(-1)}>
              <ArrowLeft aria-hidden="true" size={18} />
              返回
            </button>
            <h1 className="page-layout__title">{title}</h1>
          </div>
        )}
        <div className="page-layout__content">{children}</div>
      </main>

      <footer className="page-layout__footer">
        <div className="page-layout__footer-inner">
          <span className="page-layout__copyright">© 2026 OpenCheck Developer Tools</span>
          <div className="page-layout__footer-links">
            <a href="https://github.com/Bistu-OSSDT-2026/OpenCheck#readme" target="_blank" rel="noopener noreferrer">
              <FileText aria-hidden="true" size={16} />
              文档
            </a>
            <a href="https://github.com/Bistu-OSSDT-2026/OpenCheck" target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" size={16} />
              GitHub
            </a>
            <span>本地运行</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
