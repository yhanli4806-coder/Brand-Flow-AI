import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const BasicLayout: React.FC = () => {
  return (
    <div>
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <nav style={{ display: 'flex', gap: 16 }}>
          <NavLink to="/home">首页</NavLink>
          <NavLink to="/workspace">工作台</NavLink>
        </nav>
      </header>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  )
}
export default BasicLayout
