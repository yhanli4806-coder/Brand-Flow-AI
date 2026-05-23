import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { INTENT_ANALYSIS_PROMPT } from "../prompts/intent-prompt";
import { safeJsonParse } from "../../common";

export type IntentType = "品牌描述" | "图片生成" | "风格调整" | "其他";

export interface IntentInput {
  userQuery: string;
  context?: Record<string, any>;
}

export interface IntentOutput {
  intent: IntentType;
  confidence: number;
  reason: string;
  suggestedAction: string;
}

export function createIntentChain() {
  const llm = new ChatOpenAI({ modelName: process.env.OPENAI_MODEL_NAME || "deepseek-ai/DeepSeek-V3", temperature: 0.1 });
  const prompt = PromptTemplate.fromTemplate(INTENT_ANALYSIS_PROMPT);

  return RunnableSequence.from([
    (input) => ({
      userQuery: input.userQuery,
      context: JSON.stringify(input.context || {}),
    }),
    prompt,
    llm,
    new StringOutputParser(),
    (output) => {
      return safeJsonParse<IntentOutput>(output, { 
    intent: "其他", 
    confidence: 0, 
    reason: "解析失败", 
    suggestedAction: "重新输入" 
  })!;
    },
  ]);
}
