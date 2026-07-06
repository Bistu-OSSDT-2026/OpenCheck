/**
 * 路由配置入口 —— R3（倪子宸）所有
 *
 * 配置 5 个页面路由，全部用 ROUTE 常量，禁止硬编码路径。
 * 页面组件本身归 R4/R5，这里只做路由注册。
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTE } from '@/router/routes'
import HomePage from '@/pages/HomePage'
import ResultPage from '@/pages/ResultPage'
import ReportPage from '@/pages/ReportPage'
import HistoryPage from '@/pages/HistoryPage'
import TokenPage from '@/pages/TokenPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE.HOME} element={<HomePage />} />
        <Route path={ROUTE.RESULT} element={<ResultPage />} />
        <Route path={ROUTE.REPORT} element={<ReportPage />} />
        <Route path={ROUTE.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTE.TOKEN} element={<TokenPage />} />
        {/* 兜底：未知路径回首页 */}
        <Route path="*" element={<Navigate to={ROUTE.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
