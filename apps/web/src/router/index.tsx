/**
 * 应用路由配置
 *
 * 路由结构：
 * - /login     → AuthLayout + LoginPage    （登录页，不带侧边栏）
 * - /register  → AuthLayout + RegisterPage （注册页，不带侧边栏）
 * - /          → 根路径自动重定向到 /login
 * - /home      → AppLayout + Home           （首页，带侧边栏）
 * - /workspace → AppLayout + Workspace      （工作台，带侧边栏）
 * - /profile   → AppLayout + ProfilePage    （个人中心，带侧边栏）
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Workspace from '@/pages/workspace/workspace'
import Home from '@/pages/home/home'
import LoginPage from '@/pages/login/login'
import RegisterPage from '@/pages/login/register'
import ProfilePage from '@/pages/profile/profile'

export const router = createBrowserRouter([
  /* 未登录态路由：使用 AuthLayout（居中卡片布局，无侧边栏） */
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },

  /* 已登录态路由：使用 AppLayout（含侧边栏 + 顶部安全区） */
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'home', element: <Home /> },
      { path: 'workspace', element: <Workspace /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])