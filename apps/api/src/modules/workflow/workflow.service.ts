import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { RUN_WORKFLOW_JOB, WORKFLOW_QUEUE } from './workflow.constants';
import {
  Workflow,
  WorkflowDocument,
  WorkflowStatus,
} from './schemas/workflow.schema';

export interface WorkflowResponse {
  id: string;
  status: WorkflowStatus;
  prompt: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
  result?: Record<string, unknown>;
  errorMessage?: string;
}

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow.name)
    private readonly workflowModel: Model<WorkflowDocument>,
    @InjectQueue(WORKFLOW_QUEUE)
    private readonly workflowQueue: Queue,
  ) {}

  async create(dto: CreateWorkflowDto): Promise<WorkflowResponse> {
    const workflow = await this.workflowModel.create({
      prompt: dto.prompt,
      spaceId: dto.spaceId,
      status: 'pending',
    });

    await this.workflowQueue.add(RUN_WORKFLOW_JOB, {
      workflowId: workflow._id.toString(),
    });

    return this.toResponse(workflow);
  }

  async getStatus(id: string): Promise<WorkflowResponse> {
    const workflow = await this.workflowModel.findById(id);

    if (!workflow) {
      throw new NotFoundException('工作流不存在');
    }

    return this.toResponse(workflow);
  }

  private toResponse(workflow: WorkflowDocument): WorkflowResponse {
    return {
      id: workflow._id.toString(),
      status: workflow.status,
      prompt: workflow.prompt,
      spaceId: workflow.spaceId,
      createdAt: workflow.createdAt instanceof Date
        ? workflow.createdAt.toISOString()
        : String(workflow.createdAt),
      updatedAt: workflow.updatedAt instanceof Date
        ? workflow.updatedAt.toISOString()
        : String(workflow.updatedAt),
      result: workflow.result,
      errorMessage: workflow.errorMessage,
    };
  }
}
