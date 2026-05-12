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
  private mockGenerateResult(
    type: GenerateType,
    prompt: string,
    brandName: string
  ): string {
    const map = {
      image: `【${brandName}】品牌图片生成完成，使用提示词：${prompt.slice(0, 50)}...`,
      text: `【${brandName}】品牌文案生成完成，符合品牌风格规范`,
      brand_material: `【${brandName}】品牌物料全套生成完成`,
    };
    return map[type];
  }
}

// 单例导出
export const generateService = new GenerateService();