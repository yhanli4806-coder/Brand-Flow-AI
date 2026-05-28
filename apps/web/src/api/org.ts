// 组织 / 企业 / 团队管理
import apiClient from './index'

export type Role = 'owner' | 'admin' | 'member' | 'viewer'

// 创建企业请求参数
export interface CreateEnterpriseParams {
  name: string
  logo?: string
}

// 企业数据
export interface EnterpriseData {
  enterpriseId: string
  name: string
  logo?: string
  status: string
  role: Role
}

// 切换企业结果
export interface SwitchEnterpriseResult {
  success: boolean
  currentEnterpriseId: string
}

// 创建团队请求参数
export interface CreateTeamParams {
  name: string
  description?: string
}

// 团队数据
export interface TeamData {
  _id: string
  enterpriseId: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 创建企业
export async function createEnterprise(params: CreateEnterpriseParams) {
  return apiClient.post('/org/enterprise', params)
}

// 获取我的企业列表
export async function getMyEnterprises() {
  return apiClient.get('/org/enterprises')
}

// 切换当前企业
export async function switchEnterprise(enterpriseId: string) {
  return apiClient.put(`/org/enterprise/${enterpriseId}/switch`)
}

// 创建团队
export async function createTeam(params: CreateTeamParams) {
  return apiClient.post('/org/team', params)
}

// 获取当前企业下的团队列表
export async function getTeams() {
  return apiClient.get('/org/teams')
}
