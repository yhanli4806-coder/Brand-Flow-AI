import { RunnableSequence } from "@langchain/core/runnables";
import { createIntentChain } from "./intent-chain";
import { createPromptChain } from "./prompt-chain";
import type { IntentInput, IntentOutput } from "./intent-chain";
import type { PromptChainOutput } from "./prompt-chain";
import { brandService } from "../../brand";
import type { GenerateResult } from "../../generate/generate-types";
import { generateService } from "../../generate";
import { safeJsonParse } from "../../common";

// 工作流最终输出类型
export interface WorkflowOutput {
  userInput: string;
  intentResult: IntentOutput;
  promptResult: PromptChainOutput;
<<<<<<< HEAD
  generateResult?: GenerateResult; 
=======
  generateResult?: GenerateResult;
>>>>>>> aa1d4bda357c06231c50a3f094a1ef040a0859a3
  status: "success" | "failed";
}

// 创建完整AI工作流（意图解析 → 提示词生成）
export function createWorkflowChain() {
  const intentChain = createIntentChain();
  const promptChain = createPromptChain();

  return RunnableSequence.from<IntentInput, WorkflowOutput>([
    // 第一步：解析用户意图
    async (input) => {
      const intentResult = await intentChain.invoke(input);
      return { input, intentResult };
    },
    // 第二步：根据意图生成专业提示词
    async ({ input, intentResult }) => {
      try {
        const promptResult = await promptChain.invoke({
          userQuery: input.userQuery,
          intent: intentResult.intent,
          brandGuidelines: brandService.formatBrandContext().formattedBrandText,
          context: JSON.stringify(input.context || {}),
        });
<<<<<<< HEAD
         // 根据意图类型决定生成类型
        const generateType = intentResult.intent === "图片生成" ? "image"
                        : intentResult.intent === "品牌描述" ? "text"
                        : "brand_material";

        const generateResult = await generateService.executeGenerate({
        promptData: promptResult,
        generateType,
        sessionId: input.context?.sessionId,
    }); 
=======
        const generateType = intentResult.intent === "image" ? "image"
                      : intentResult.intent === "text" ? "text"
                      : "brand_material";

    const generateResult = await generateService.executeGenerate({
      promptData: promptResult,
      generateType,
      sessionId: input.context?.sessionId,
    });
>>>>>>> aa1d4bda357c06231c50a3f094a1ef040a0859a3

        return {
          userInput: input.userQuery,
          intentResult,
          promptResult,
          generateResult,
          status: "success",
        };
      } catch (error) {
        // 异常兜底处理，无任何未定义变量
        return {
          userInput: input.userQuery,
          intentResult,
          promptResult: {
            systemPrompt: "工作流执行失败",
            userPrompt: "生成失败",
            finalPrompt: "生成失败",
            purpose: "流程异常",
          },
          status: "failed",
        };
      }
    },
  ]);
}