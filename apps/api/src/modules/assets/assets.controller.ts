import { Controller, Post, Get, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/assets.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard) // 保护所有资产端点
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  async createAsset(@Req() req: any, @Body() createDto: CreateAssetDto) {
    const userId = req.user.sub;
    const enterpriseId = req.user.entId;
    return this.assetsService.createAsset(userId, enterpriseId, createDto);
  }

  @Get()
  async getAssets(@Req() req: any) {
    const userId = req.user.sub;
    const enterpriseId = req.user.entId;
    return this.assetsService.getAssets(userId, enterpriseId);
  }

  @Delete(':id')
  async deleteAsset(@Req() req: any, @Param('id') assetId: string) {
    const userId = req.user.sub;
    return this.assetsService.deleteAsset(userId, assetId);
  }
}
