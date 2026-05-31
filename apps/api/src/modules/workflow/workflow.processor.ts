import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { createAgentGraph, AgentStateType } from '@brand-flow/agent';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { RUN_WORKFLOW_JOB, WORKFLOW_QUEUE } from './workflow.constants';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';

interface RunWorkflowJobData {
  workflowId: string;
  knowledgeId?: string;
}

@Processor(WORKFLOW_QUEUE)
export class WorkflowProcessor extends WorkerHost {
  constructor(
    @InjectModel(Workflow.name)
    private readonly workflowModel: Model<WorkflowDocument>,
  ) {
    super();
  }

  async process(job: Job<RunWorkflowJobData>): Promise<AgentStateType | void> {
    if (job.name !== RUN_WORKFLOW_JOB) return;

    const workflow = await this.workflowModel.findById(job.data.workflowId);
    if (!workflow) return;

    await this.workflowModel.findByIdAndUpdate(workflow._id, {
      status: 'running',
      $unset: { errorMessage: 1 },
    });

    try {
      const graph = createAgentGraph();
      const initialState: Partial<AgentStateType> = {
        userQuery: workflow.prompt,
        context: {
          spaceId: workflow.spaceId,
          enterpriseId: workflow.spaceId, // 将空间 ID 充当 enterpriseId 透传
          knowledgeId: job.data.knowledgeId,
        },
        retryCount: 0,
        status: "running",
      };

      let finalState: Partial<AgentStateType> = { ...initialState };

      // 使用 stream 保留流式进度输出，并通过浅合并来聚合所有的状态
      const stream = await graph.stream(initialState);
      for await (const chunk of stream) {
        await job.updateProgress(chunk);
        const update = Object.values(chunk)[0] as Partial<AgentStateType>;
        finalState = { ...finalState, ...update };
      }

      // ✅ 直接使用 Agent 返回的 status，不再自行二次判定
      const isSuccess = finalState?.status === 'success';

      await this.workflowModel.findByIdAndUpdate(workflow._id, {
        status: isSuccess ? 'completed' : 'failed',
        result: finalState as AgentStateType,
        // ✅ 如果有 error，也一并写入
        ...(finalState?.error ? { errorMessage: finalState.error } : { $unset: { errorMessage: 1 } }),
      });

      return finalState as AgentStateType;
    } catch (error) {
      await this.workflowModel.findByIdAndUpdate(workflow._id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '工作流执行失败',
      });
      throw error;
    }
  }
}
