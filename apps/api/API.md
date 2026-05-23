# Brand-Flow AI - 接口规范

## 1. 全局配置

*   **Base URL**: `http://localhost:3000/api`
*   **默认 Header**: `Content-Type: application/json`
*   **鉴权**: `Authorization: Bearer <JWT_TOKEN>` (除非标记了 `[无需鉴权]`，否则所有接口均需携带)
*   **统一返回格式**: 所有成功响应都会被包装在如下结构中：
    ```typescript
    interface ApiResponse<T = any> {
      success: true; // 请求是否成功
      data: T;       // 核心业务数据
    }
    ```

---

## 2. 公共数据类型

```typescript
type Role = 'owner' | 'admin' | 'member' | 'viewer';
type OwnerType = 'user' | 'team' | 'enterprise';
type Visibility = 'private' | 'team' | 'enterprise' | 'public';
type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';

interface UserInfo {
  userId: string;        // 用户唯一标识 ID
  email: string;         // 用户登录邮箱
  nickname?: string;     // 用户昵称（选填）
  enterpriseId?: string; // 当前激活的企业 ID（选填）
  role?: Role;           // 用户在当前企业的角色权限（选填）
}
```

---

## 3. API 路由声明

### 身份鉴权模块 (/auth)

*   **`POST /auth/register`** `[无需鉴权]`
    *   **Body**: 
        ```typescript
        { 
          email: string,           // 注册邮箱地址
          password: string,        // 账户密码，长度 >= 6
          nickname?: string        // 用户昵称，长度 <= 20（选填）
        }
        ```
    *   **返回 Data**: `UserInfo`

*   **`POST /auth/login`** `[无需鉴权]`
    *   **Body**: 
        ```typescript
        { 
          email: string,     // 登录邮箱
          password: string   // 登录密码
        }
        ```
    *   **返回 Data**: 
        ```typescript
        { 
          access_token: string, // JWT 身份凭证
          user: UserInfo       // 登录用户信息
        }
        ```

*   **`GET /auth/profile`**
    *   **返回 Data**: `UserInfo`

---

### 组织与团队模块 (/org)

*   **`POST /org/enterprise`**
    *   **Body**: 
        ```typescript
        { 
          name: string,     // 企业名称，长度 <= 50
          logo?: string     // 企业 Logo 图片的 URL（选填）
        }
        ```

*   **`GET /org/enterprises`**
    *   **返回 Data**: 
        ```typescript
        Array<{ 
          id: string,       // 企业唯一 ID
          name: string,     // 企业名称
          logo?: string     // 企业 Logo URL（选填）
        }>
        ```

*   **`PUT /org/enterprise/:id/switch`**
    *   **路径参数**: `id` (需要切换到的目标企业 ID)
    *   **返回 Data**: `{ success: boolean }` // 切换成功标识

*   **`POST /org/team`** `[需 OWNER 或 ADMIN 角色]`
    *   **Body**: 
        ```typescript
        { 
          name: string,           // 团队名称，长度 <= 50
          description?: string    // 团队描述信息，长度 <= 200（选填）
        }
        ```

*   **`GET /org/teams`**
    *   **返回 Data**: 
        ```typescript
        Array<{ 
          id: string,             // 团队唯一 ID
          name: string,           // 团队名称
          description?: string    // 团队描述信息（选填）
        }>
        ```

---

### 素材与资产模块 (/assets)

*   **`POST /assets`**
    *   **Body**: 
        ```typescript
        { 
          name: string,                     // 资产名称
          type: string,                     // 资产类型标识（如 image, template 等）
          url: string,                      // 资产对应的真实存储地址
          ownerId: string,                  // 资产归属方的 ID
          ownerType: OwnerType,             // 资产的归属类型
          visibility: Visibility,           // 资产的可见性级别
          metadata?: Record<string, any>    // 资产的扩展属性（选填）
        }
        ```

*   **`GET /assets`**
    *   **返回 Data**: `Array<Asset>` // 资产对象数组

*   **`DELETE /assets/:id`**
    *   **路径参数**: `id` (要删除的资产 ID)

---

### 智能图文工作流模块 (/workflow)

*   **`POST /workflow/create`**
    *   **说明**: 触发异步 AI 执行，返回状态为 `pending`。
    *   **Body**: 
        ```typescript
        { 
          prompt: string,   // 用户的原始设计意图或提示词
          spaceId: string   // 当前工作流关联的前端空间或画布 ID
        }
        ```
    *   **返回 Data**: 
        ```typescript
        {
          id: string,               // 创建的工作流实例 ID
          status: WorkflowStatus,   // 初始状态（pending）
          prompt: string,           // 记录的原始提示词
          spaceId: string,          // 记录的空间 ID
          createdAt: string,        // 创建时间
          updatedAt: string         // 更新时间
        }
        ```

*   **`GET /workflow/:id/status`**
    *   **说明**: 轮询此接口以获取异步执行状态和最终大模型生成的提示词。
    *   **路径参数**: `id` (目标工作流的实例 ID)
    *   **返回 Data**:
        ```typescript
        {
          id: string,               // 工作流实例 ID
          status: WorkflowStatus,   // 当前执行状态
          prompt: string,           // 原始请求提示词
          spaceId: string,          // 关联空间 ID
          createdAt: string,        // 创建时间
          updatedAt: string,        // 最后更新时间
          errorMessage?: string,    // 若执行失败，返回的错误原因（当 status === 'failed' 时存在）
          result?: {                // 若执行成功，返回的完整解析结果（当 status === 'completed' 时存在）
            userInput: string,      // AI 识别到的用户输入
            intentResult: {         // 意图解析结果
              intent: string,           // 意图分类
              confidence: number,       // 意图置信度
              reason: string,           // 判定理由
              suggestedAction: string   // 建议的下一步动作
            },
            promptResult: {         // 提示词生成结果
              systemPrompt: string,     // 定制的系统提示词
              userPrompt: string,       // 定制的用户提示词
              finalPrompt: string,      // 最终下发给生图引擎的提示词
              purpose: string           // 该提示词的生成意图
            },
            status: "success" | "failed" // 单个链的执行状态
          }
        }
        ```
