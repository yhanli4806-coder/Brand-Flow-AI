/**
 * Axios 实例与拦截器封装
 *
 * 架构说明：
 * - 提供统一的 axios 实例，配置 baseURL、超时、请求/响应拦截器
 * - USE_MOCK 开关控制是否使用 mock 数据（开发阶段 = true）
 * - 切换为 false 即可对接真实后端 API，无需改动页面代码
 */

import axios from 'axios'

// ============================================================
// Mock 模式开关
// - true  = 所有 API 走 mock 数据（当前开发阶段）
// - false = 走真实后端 HTTP 请求（对接 apps/api NestJS）
// ============================================================
export const USE_MOCK = true

// ============================================================
// Axios 实例
// ============================================================
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ----- 请求拦截器 -----
// 自动注入 token（从 auth store 中读取）
apiClient.interceptors.request.use(
  (config) => {
    // 后续可以从 useAuthStore 获取 token 并注入
    // const token = useAuthStore.getState().token
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ----- 响应拦截器 -----
// 统一处理错误（401 跳登录、网络异常提示等）
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // token 过期，跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient

// ============================================================
// Mock 工具函数
// ============================================================

/**
 * 模拟网络延迟
 * @param ms 延迟毫秒数（默认 600ms，模拟真实网络）
 */
export function mockDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 包装 mock 响应（统一返回格式）
 * @param data 返回数据
 * @param success 是否成功
 */
export function mockResponse<T>(data: T, success = true) {
  return { success, data, message: success ? 'ok' : 'error' }
}

/**
 * 统一 API 调用入口
 * - mock 模式下直接调用 mockFn 返回假数据
 * - 非 mock 模式下走 axios 真实请求
 */
export async function callApi<T>(
  mockFn: () => Promise<T>,
  requestFn: () => Promise<T>,
): Promise<T> {
  if (USE_MOCK) {
    return mockFn()
  }
  return requestFn()
}