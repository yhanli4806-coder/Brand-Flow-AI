/**
 * 认证 API（登录 / 注册）
 *
 * 接口：
 * - login: 邮箱密码登录
 * - register: 新用户注册
 */

import apiClient, { callApi, mockDelay, mockResponse } from './index'

// ============================================================
// 类型定义
// ============================================================

/** 登录请求参数 */
export interface LoginParams {
  email: string    // 企业邮箱
  password: string // 登录密码
}

/** 注册请求参数 */
export interface RegisterParams {
  name: string            // 用户姓名
  email: string           // 企业邮箱
  password: string        // 登录密码
  confirmPassword: string // 确认密码（用于前端校验）
}

/** 认证成功返回的数据结构 */
export interface AuthResult {
  token: string                 // JWT token，后续请求携带用于身份验证
  user: {
    name: string  // 用户显示名称
    email: string // 用户邮箱
  }
}

// ============================================================
// Mock 实现
// ============================================================

/** 预设的 mock 账号表，key = 邮箱，value = 密码 + 姓名 */
const mockAccounts: Record<string, { password: string; name: string }> = {
  'wang@hdu.edu.cn': { password: '123456', name: '王一恒' },
}

/** mock 登录逻辑：校验账号是否存在、密码是否正确 */
async function mockLogin(params: LoginParams) {
  await mockDelay(800)
  const account = mockAccounts[params.email]
  if (!account) {
    throw new Error('账号不存在')
  }
  if (account.password !== params.password) {
    throw new Error('密码错误')
  }
  return mockResponse({
    token: `mock_token_${Date.now()}`,
    user: { name: account.name, email: params.email },
  })
}

/** mock 注册逻辑：校验邮箱是否已被注册，通过后写入账号表 */
async function mockRegister(params: RegisterParams) {
  await mockDelay(800)
  if (mockAccounts[params.email]) {
    throw new Error('该邮箱已被注册')
  }
  mockAccounts[params.email] = { password: params.password, name: params.name }
  return mockResponse({
    token: `mock_token_${Date.now()}`,
    user: { name: params.name, email: params.email },
  })
}

// ============================================================
// 导出 API 函数
// ============================================================

/** 邮箱密码登录 */
export async function login(params: LoginParams) {
  return callApi(
    () => mockLogin(params),
    () => apiClient.post('/auth/login', params),
  )
}

/** 新用户注册 */
export async function register(params: RegisterParams) {
  return callApi(
    () => mockRegister(params),
    () => apiClient.post('/auth/register', params),
  )
}