import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowResponse, WorkflowService } from './workflow.service';

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('create')
  create(@Body() dto: CreateWorkflowDto): Promise<WorkflowResponse> {
    return this.workflowService.create(dto);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string): Promise<WorkflowResponse> {
    return this.workflowService.getStatus(id);
  }
}
