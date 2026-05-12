import { BrandGuidelines, BrandContext } from "./brand-types";

// 默认品牌规范（可对接后端数据库）
const DEFAULT_BRAND: BrandGuidelines = {
  brandName: "默认品牌",
  brandStyle: ["简约", "现代", "专业"],
  mainColors: ["#ffffff", "#000000"],
  targetAudience: "全年龄段",
  forbiddenContent: ["低俗", "暴力", "违规元素"],
};

// 品牌服务：获取/格式化品牌规范
export class BrandService {
  // 获取品牌规范
  getBrandGuidelines(brandName?: string): BrandGuidelines {
    // 生产环境可替换为接口请求
    return DEFAULT_BRAND;
  }

  // 格式化品牌规范为AI可识别的文本
  formatBrandContext(brand?: BrandGuidelines): BrandContext {
    const target = brand || DEFAULT_BRAND;
    
    const formattedText = `
品牌名称：${target.brandName}
品牌风格：${target.brandStyle.join("、")}
主色调：${target.mainColors.join("、")}
目标受众：${target.targetAudience}
禁忌内容：${target.forbiddenContent?.join("、") || "无"}
    `.trim();

    return {
      formattedBrandText: formattedText,
      isValid: true,
    };
  }
}

// 单例导出（全局复用）
export const brandService = new BrandService();