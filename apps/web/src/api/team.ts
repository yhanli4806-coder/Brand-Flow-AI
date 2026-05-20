/**
 * 团队 / 空间管理 API
 *
 * 接口：
 * - getSpaces: 获取所有可用空间列表
 * - getTeamMembers: 获取指定空间的团队成员列表
 * - inviteMember: 邀请成员加入空间
 */

import apiClient, { callApi, mockDelay, mockResponse } from './index'

// ============================================================
// 类型定义
// ============================================================

/** 空间数据 */
export interface SpaceData {
  id: string
  name: string
  isCurrent: boolean
}

/** 团队成员数据 */
export interface TeamMemberData {
  id: string
  name: string
  role: string
  roleType: 'admin' | 'member'
  isSelf?: boolean
}

/** 邀请成员请求参数 */
export interface InviteMemberParams {
  email: string
  spaceId: string
  roleType: 'admin' | 'member'
}

// ============================================================
// Mock 数据
// ============================================================

const mockSpaces: SpaceData[] = [
  { id: 'ruixing', name: '瑞幸项目组', isCurrent: true },
  { id: 'personal', name: '个人独立空间', isCurrent: false },
]

const mockMembers: TeamMemberData[] = [
  { id: 'u_001', name: '张主管', role: '管理员', roleType: 'admin' },
  { id: 'u_002', name: '王一恒 (我)', role: '普通成员', roleType: 'member', isSelf: true },
]

// ============================================================
// Mock 实现
// ============================================================

async function mockGetSpaces() {
  await mockDelay(400)
  return mockResponse(mockSpaces)
}

async function mockGetTeamMembers(spaceId: string) {
  await mockDelay(500)
  // 不同空间返回不同的 mock 数据
  if (spaceId === 'personal') {
    return mockResponse([])
  }
  return mockResponse(mockMembers)
}

async function mockInviteMember(_params: InviteMemberParams) {
  await mockDelay(600)
  return mockResponse({ invited: true })
}

// ============================================================
// 导出 API 函数
// ============================================================

/** 获取所有可用空间列表 */
export async function getSpaces() {
  return callApi(
    () => mockGetSpaces(),
    () => apiClient.get('/team/spaces'),
  )
}

/** 获取指定空间的团队成员列表 */
export async function getTeamMembers(spaceId: string) {
  return callApi(
    () => mockGetTeamMembers(spaceId),
    () => apiClient.get(`/team/${spaceId}/members`),
  )
}

/** 邀请成员加入空间 */
export async function inviteMember(params: InviteMemberParams) {
  return callApi(
    () => mockInviteMember(params),
    () => apiClient.post('/team/invite', params),
  )
}