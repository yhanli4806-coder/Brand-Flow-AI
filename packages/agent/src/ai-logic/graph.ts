import {
  StateGraph,
  END,
  START,
  Annotation,
} from "@langchain/langgraph";

import { createIntentChain, IntentOutput } from "./chains/intent-chain";
import { createPromptChain, PromptChainOutput } from "./chains/prompt-chain";
import { createPromptEvaluationChain } from "./evaluate/prompt-evaluate.chain";
import type { EvaluationResult } from "./evaluate/evaluate-types";
import type { GenerateResult } from "../generate/generate-types";
import { generateService } from "../generate";
import { brandService } from "../brand";
import { conversationMemory } from "./memory/conversation-memory";

// ============================================================
// 1. 定义 AgentState（带注解的运行时状态）
// 注：不使用 Annotation<Type>({...}) 泛型语法，
//     避免 TypeScript 6.x 误解析为 JSX 标签
// ============================================================
export const AgentState = Annotation.Root({
  // 用户原始输入
  userQuery: Annotation({
    reducer: (prev: string, next: string) => next ?? prev,
  }),
  // 会话上下文
  context: Annotation({
    reducer: (prev: Record<string, any> | undefined, next: Record<string, any> | undefined) => next ?? prev,
    default: () => ({}),
  }),
  // 意图分析结果
  intentResult: Annotation({
    reducer: (prev: IntentOutput | undefined, next: IntentOutput | undefined) => next ?? prev,
  }),
  // 知识库上下文（额外获取的品牌规范、历史等）
  knowledgeContext: Annotation({
    reducer: (prev: string | undefined, next: string | undefined) => next ?? prev,
  }),
  // 提示词生成结果
  promptResult: Annotation({
    reducer: (prev: PromptChainOutput | undefined, next: PromptChainOutput | undefined) => next ?? prev,
  }),
  // 生成结果（图片/文本/物料）
  generateResult: Annotation({
    reducer: (prev: GenerateResult | undefined, next: GenerateResult | undefined) => next ?? prev,
  }),
  // 评估结果
  evaluationResult: Annotation({
    reducer: (prev: EvaluationResult | undefined, next: EvaluationResult | undefined) => next ?? prev,
  }),
  // 重试计数器（防无限循环）
  retryCount: Annotation({
    reducer: (prev: number, next: number) => (prev ?? 0) + (next ?? 0),
    default: () => 0,
  }),
  // 最终状态
  status: Annotation({
    reducer: (prev: "running" | "success" | "failed", next: "running" | "success" | "failed") => next ?? prev,
    default: () => "running" as const,
  }),
  // 错误信息
  error: Annotation({
    reducer: (prev: string | undefined, next: string | undefined) => next ?? prev,
  }),
}) as any;

export type AgentStateType = typeof AgentState.State;

// ============================================================
// 2. 节点函数
// ============================================================

// ---------- 意图识别节点 ----------
export async function intentNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  try {
    const intentChain = createIntentChain();
    const result = await intentChain.invoke({
      userQuery: state.userQuery,
      context: state.context,
    });
    return {
      intentResult: result,
      status: "running",
    };
  } catch (error: any) {
    return {
      status: "failed",
      error: `意图识别失败: ${error.message}`,
    };
  }
}

// ---------- 知识注入节点 ----------
export async function knowledgeNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  try {
    // 从品牌服务获取格式化的品牌规范
    const brandContext = brandService.formatBrandContext();
    // 从对话记忆获取历史
    const sessionId = state.context?.sessionId;
    const history = sessionId
      ? conversationMemory.getFormattedHistory(sessionId)
      : "";

    const knowledgeContext = [
      brandContext.formattedBrandText,
      history ? `对话历史：\n${history}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      knowledgeContext,
      status: "running",
    };
  } catch (error: any) {
    return {
      status: "failed",
      error: `知识获取失败: ${error.message}`,
    };
  }
}

// ---------- 提示词生成节点 ----------
export async function promptNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  try {
    const promptChain = createPromptChain();
    const result = await promptChain.invoke({
      userQuery: state.userQuery,
      intent: state.intentResult?.intent ?? "其他",
      brandGuidelines: state.knowledgeContext ?? brandService.formatBrandContext().formattedBrandText,
      context: state.knowledgeContext,
    });
    return {
      promptResult: result,
      status: "running",
    };
  } catch (error: any) {
    return {
      status: "failed",
      error: `提示词生成失败: ${error.message}`,
    };
  }
}

// ---------- 内容生成节点 ----------
export async function generateNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  try {
    const intent = state.intentResult?.intent;
    const generateType =
      intent === "图片生成"
        ? "image"
        : intent === "品牌描述"
        ? "text"
        : "brand_material";

    const result = await generateService.executeGenerate({
      promptData: state.promptResult!,
      generateType,
      sessionId: state.context?.sessionId,
    });

    // 将生成记录存入对话记忆
    if (state.context?.sessionId) {
      conversationMemory.addMessage({
        sessionId: state.context.sessionId,
        message: {
          role: "assistant",
          content: result.content.slice(0, 500), // 只存摘要避免撑爆内存
          timestamp: Date.now(),
        },
      });
    }

    return {
      generateResult: result,
      status: result.success ? "running" : "failed",
      error: result.success ? undefined : result.message ?? "生成返回失败",
    };
  } catch (error: any) {
    return {
      status: "failed",
      error: `内容生成失败: ${error.message}`,
    };
  }
}

// ---------- 质量评估节点 ----------
export async function evaluateNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  try {
    const evalChain = createPromptEvaluationChain();
    const result = await evalChain.invoke({
      userQuery: state.userQuery,
      intentResult: state.intentResult!,
      promptResult: state.promptResult!,
      brandGuidelines: state.knowledgeContext,
    });
    return {
      evaluationResult: result,
      status: "running",
    };
  } catch (error: any) {
    // 评估失败视为可继续（不阻塞流程），但标记为低分以触发重试
    return {
      evaluationResult: {
        overallScore: 1,
        intentEvaluation: { score: 1, comment: "评估异常" },
        promptEvaluation: { score: 1, comment: "评估异常" },
        complianceEvaluation: { score: 1, comment: "评估异常" },
        suggestions: ["评估系统异常，请检查"],
        status: "failed",
      },
      status: "running",
    };
  }
}

// ============================================================
// 3. 条件路由函数
// ============================================================

// 评估后路由：达标则结束，否则回到 promptNode 重试（最多 2 次）
export function routeAfterEvaluation(
  state: AgentStateType
): "promptNode" | typeof END {
  const retryCount = state.retryCount ?? 0;
  const score = state.evaluationResult?.overallScore ?? 1;
  const THRESHOLD = 4; // 最低合格分数

  // 如果不合格且还有重试次数，回到提示词节点重试
  if (score < THRESHOLD && retryCount < 2) {
    console.log(
      `[LangGraph] 评估得分 ${score} < ${THRESHOLD}，第 ${retryCount + 1} 次重试...`
    );
    return "promptNode";
  }

  // 合格或已用完重试次数，结束流程
  if (score < THRESHOLD) {
    console.log(`[LangGraph] 重试耗尽，最终得分 ${score}，流程结束`);
  }
  return END;
}

// ============================================================
// 4. 构建 LangGraph
// ============================================================

export function createAgentGraph(): any {
  const workflow = new StateGraph(AgentState)
    // 添加节点
    .addNode("intentNode", intentNode)
    .addNode("knowledgeNode", knowledgeNode)
    .addNode("promptNode", promptNode)
    .addNode("generateNode", generateNode)
    .addNode("evaluateNode", evaluateNode)

    // 入口边：START → intentNode
    .addEdge(START, "intentNode")

    // 固定顺序边
    .addEdge("intentNode", "knowledgeNode")
    .addEdge("knowledgeNode", "promptNode")
    .addEdge("promptNode", "generateNode")
    .addEdge("generateNode", "evaluateNode")

    // 条件边：根据评估结果决定是否重试或结束
    .addConditionalEdges("evaluateNode", routeAfterEvaluation, {
      promptNode: "promptNode",
      [END]: END,
    });

  return workflow.compile();
}

// ============================================================
// 5. 便捷调用函数
// ============================================================

export async function runAgent(params: {
  userQuery: string;
  context?: Record<string, any>;
}): Promise<AgentStateType> {
  const graph = createAgentGraph();
  const initialState: Partial<AgentStateType> = {
    userQuery: params.userQuery,
    context: params.context ?? {},
    retryCount: 0,
    status: "running",
    // 其他字段自动 undefined
  };

  const finalState = await graph.invoke(initialState);
  return finalState as AgentStateType;
}