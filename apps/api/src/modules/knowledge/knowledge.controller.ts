import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto, UpdateKnowledgeDto, IngestKnowledgeDto } from './dto/knowledge.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async create(@Req() req: any, @Body() createDto: CreateKnowledgeDto) {
    return this.knowledgeService.create(req.user.sub, req.user.entId, createDto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.knowledgeService.findAll(req.user.entId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.knowledgeService.findOne(req.user.entId, id);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateKnowledgeDto) {
    return this.knowledgeService.update(req.user.sub, req.user.entId, id, updateDto);
  }

  @Post(':id/ingest')
  async ingest(@Req() req: any, @Param('id') id: string, @Body() ingestDto: IngestKnowledgeDto) {
    return this.knowledgeService.ingestText(req.user.sub, req.user.entId, id, ingestDto.content);
  }

  @Get(':id/records')
  async getRecords(@Req() req: any, @Param('id') id: string) {
    return this.knowledgeService.getRecords(req.user.entId, id);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.knowledgeService.remove(req.user.sub, req.user.entId, id);
  }
}
