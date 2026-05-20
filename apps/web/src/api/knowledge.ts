/**
 * 知识库存储 API
 *
 * 接口：
 * - saveToKnowledgeBase: 将素材存入知识库
 * - getKnowledgeBases: 获取可选的知识库列表（保存位置）
 */

import apiClient, { callApi, mockDelay, mockResponse } from './index'

// ============================================================
// 类型定义
// ============================================================

/** 存入知识库请求参数 */
export interface SaveToKbParams {
  materialName: string
  tags: string[]
  targetKbId: string
}

/** 知识库选项 */
export interface KnowledgeBaseOption {
  id: string
  name: string
}

/** 保存结果 */
export interface SaveResult {
  id: string
  savedAt: string
}

// ============================================================
// Mock 数据
// ============================================================

const mockKbOptions: KnowledgeBaseOption[] = [
  { id: 'personal', name: '个人知识库' },
  { id: 'team', name: '瑞幸项目组知识库' },
  { id: 'global', name: '集团全局知识库' },
]

// ============================================================
// Mock 实现
// ============================================================

async function mockSaveToKb(_params: SaveToKbParams) {
  await mockDelay(700)
  return mockResponse({
    id: `kb_${Date.now()}`,
    savedAt: new Date().toISOString(),
  })
}

async function mockGetKnowledgeBases() {
  await mockDelay(300)
  return mockResponse(mockKbOptions)
}

// ============================================================
// 导出 API 函数
// ============================================================

/** 将素材存入指定的知识库 */
export async function saveToKnowledgeBase(params: SaveToKbParams) {
  return callApi(
    () => mockSaveToKb(params),
    () => apiClient.post('/knowledge-base/save', params),
  )
}

/** 获取可选的知识库列表 */
export async function getKnowledgeBases() {
  return callApi(
    () => mockGetKnowledgeBases(),
    () => apiClient.get('/knowledge-base/list'),
  )
}