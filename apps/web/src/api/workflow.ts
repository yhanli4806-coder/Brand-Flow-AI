/**
 * 工作流 / 创意提交 API
 *
 * 接口：
 * - submitPrompt: 提交创意描述，创建 AI 创作工作流
 * - getWorkflowStatus: 查询工作流执行状态
 */

import apiClient, { callApi, mockDelay, mockResponse } from './index'

// ============================================================
// 类型定义
// ============================================================

/** 提交创意请求参数 */
export interface SubmitPromptParams {
  prompt: string
  spaceId: string
}

/** 工作流数据 */
export interface WorkflowData {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  prompt: string
  createdAt: string
}

// ============================================================
// Mock 实现
// ============================================================

async function mockSubmitPrompt(params: SubmitPromptParams) {
  await mockDelay(800)
  return mockResponse({
    id: `wf_${Date.now()}`,
    status: 'pending',
    prompt: params.prompt,
    createdAt: new Date().toISOString(),
  })
}

async function mockGetWorkflowStatus(id: string) {
  await mockDelay(500)
  return mockResponse({
    id,
    status: 'running',
    prompt: '',
    createdAt: new Date().toISOString(),
  })
}

// ============================================================
// 导出 API 函数（页面层统一调用，不关心 mock 还是真实）
// ============================================================

/** 提交创意描述，创建 AI 创作工作流 */
export async function submitPrompt(params: SubmitPromptParams) {
  return callApi(
    () => mockSubmitPrompt(params),
    () => apiClient.post('/workflow/create', params),
  )
}

/** 查询工作流执行状态 */
export async function getWorkflowStatus(id: string) {
  return callApi(
    () => mockGetWorkflowStatus(id),
    () => apiClient.get(`/workflow/${id}/status`),
  )
}