import { GenerateRequest, GenerateResult, GenerateType } from "./generate-types";
import { brandService } from "../brand";

// 生成服务核心类
export class GenerateService {
  // 执行生成
  async executeGenerate(req: GenerateRequest): Promise<GenerateResult> {
    try {
      const { promptData, generateType = "image" } = req;
      const brand = brandService.getBrandGuidelines();

      // 模拟生成逻辑（生产可替换为GPT/文生图模型）
      const resultContent = this.mockGenerateResult(
        generateType,
        promptData.finalPrompt,
        brand.brandName
      );

      return {
        success: true,
        content: resultContent,
        generateType,
        promptUsed: promptData.finalPrompt,
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        generateType: req.generateType || "image",
        promptUsed: "",
        message: "生成失败，请重试",
      };
    }
  }

  // 模拟生成结果（生产替换为真实AI模型）
  private mockGenerateResult(type: GenerateType, prompt: string, brandName: string): string {
  return JSON.stringify({
    type,
    brandName,
    content: `模拟${type === 'image' ? '图片' : type === 'text' ? '文案' : '物料'}生成结果`,
    promptUsed: prompt.slice(0, 100),
  });
}
}

// 单例导出
export const generateService = new GenerateService();