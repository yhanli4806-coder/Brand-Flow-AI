/**
 * 用户 / 空间全局状态 Store
 *
 * 管理：
 * - 当前选中的空间 ID，供全平台共享
 * - 切换空间的 action
 */

import { create } from 'zustand'

interface UserState {
  /** 当前选中的空间 ID */
  currentSpaceId: string
  /** 切换到指定空间 */
  setCurrentSpaceId: (spaceId: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  currentSpaceId: 'ruixing',
  setCurrentSpaceId: (spaceId) => set({ currentSpaceId: spaceId }),
}))