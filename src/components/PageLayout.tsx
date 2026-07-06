/**
 * PageLayout —— R3（倪子宸）所有
 *
 * 用途：页面外层容器（导航栏 + 返回按钮 + 内容区）
 * 读取方：R4（首页/结果页）、R5（报告页/历史页/Token 页）—— 所有页面都包这一层
 *
 * Day 2-3 完善导航栏（顶部 Logo、页面间跳转链接、移动端适配）。
 */

import type { ReactNode } from 'react'

export interface PageLayoutProps {
  /** 页面标题（显示在导航栏下方） */
  title: string
  /** 页面内容 */
  children: ReactNode
  /** 是否显示返回按钮（首页不显示，默认 true） */
  showBack?: boolean
}

/** Day 1 空壳版本 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTE } from '@/router/routes'

export function PageLayout({ title, children, showBack = true }: PageLayoutProps) {
  const navigate = useNavigate()

  // 当前页高亮（PRD §5.7.3：历史/Token 入口放顶部导航）
  const navItems = [
    { label: '历史记录', route: ROUTE.HISTORY },
    { label: 'Token 配置', route: ROUTE.TOKEN },
  ]

  return (
    <div className="page-layout">
      <header className="page-layout__nav">
        <Link className="page-layout__logo" to={ROUTE.HOME}>
          OpenCheck
        </Link>
        <nav className="page-layout__links">
          {navItems.map((item) => (
            <NavLink
              key={item.route}
              className={({ isActive }) =>
                `page-layout__link${isActive ? ' page-layout__link--active' : ''}`
              }
              to={item.route}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page-layout__main">
        {showBack && (
          <button className="page-layout__back" onClick={() => navigate(-1)}>← 返回</button>
        )}
        <h1 className="page-layout__title">{title}</h1>
        <div className="page-layout__content">{children}</div>
      </main>
    </div>
  )
}
