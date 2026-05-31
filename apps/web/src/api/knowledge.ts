// 知识库 API
import apiClient from './index'

// 创建知识库请求参数
export interface CreateKnowledgeParams {
  name: string
  description?: string
}

// 更新知识库请求参数
export interface UpdateKnowledgeParams {
  name?: string
  description?: string
}

// 导入文本请求参数
export interface IngestKnowledgeParams {
  content: string
}

// 知识库数据
export interface KnowledgeData {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 知识记录数据
export interface KnowledgeRecordData {
  id: string
  knowledgeId: string
  content: string
  createdAt?: string
  updatedAt?: string
}

// 创建知识库
export async function createKnowledge(params: CreateKnowledgeParams) {
  return apiClient.post('/knowledge', params)
}

// 获取知识库列表
export async function getKnowledgeList() {
  return apiClient.get('/knowledge')
}

// 获取单个知识库
export async function getKnowledgeById(id: string) {
  return apiClient.get(`/knowledge/${id}`)
}

// 更新知识库
export async function updateKnowledge(id: string, params: UpdateKnowledgeParams) {
  return apiClient.put(`/knowledge/${id}`, params)
}

// 导入文本到知识库
export async function ingestKnowledge(id: string, params: IngestKnowledgeParams) {
  return apiClient.post(`/knowledge/${id}/ingest`, params)
}

// 获取知识库记录
export async function getKnowledgeRecords(id: string) {
  return apiClient.get(`/knowledge/${id}/records`)
}

// 删除知识库
export async function deleteKnowledge(id: string) {
  return apiClient.delete(`/knowledge/${id}`)
}
