import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { createWorkflowChain } from '@brand-flow/agent';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { RUN_WORKFLOW_JOB, WORKFLOW_QUEUE } from './workflow.constants';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';

interface RunWorkflowJobData {
  workflowId: string;
}

@Processor(WORKFLOW_QUEUE)
export class WorkflowProcessor extends WorkerHost {
  constructor(
    @InjectModel(Workflow.name)
    private readonly workflowModel: Model<WorkflowDocument>,
  ) {
    super();
  }

  async process(job: Job<RunWorkflowJobData>): Promise<void> {
    if (job.name !== RUN_WORKFLOW_JOB) return;

    const workflow = await this.workflowModel.findById(job.data.workflowId);
    if (!workflow) return;

    await this.workflowModel.findByIdAndUpdate(workflow._id, {
      status: 'running',
      $unset: { errorMessage: 1 },
    });

    try {
      const chain = createWorkflowChain();
      const result = await chain.invoke({
        userQuery: workflow.prompt,
        context: {
          spaceId: workflow.spaceId,
        },
      });

      await this.workflowModel.findByIdAndUpdate(workflow._id, {
        status: result.status === 'success' ? 'completed' : 'failed',
        result,
        $unset: { errorMessage: 1 },
      });
    } catch (error) {
      await this.workflowModel.findByIdAndUpdate(workflow._id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '工作流执行失败',
      });
    }
  }
}
