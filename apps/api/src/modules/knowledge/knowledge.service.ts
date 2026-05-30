import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Knowledge, KnowledgeDocument } from './schemas/knowledge.schema';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './dto/knowledge.dto';
import { User, UserDocument } from '@/modules/org/schemas/user.schema';
import { Role } from '@/common/enums';
import { ingestDocument } from '@brand-flow/agent';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(Knowledge.name) private knowledgeModel: Model<KnowledgeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, enterpriseId: string, dto: CreateKnowledgeDto) {
    if (!enterpriseId) {
      throw new BadRequestException('请先选择或切换到一家企业');
    }

    const knowledge = await this.knowledgeModel.create({
      ...dto,
      creatorId: new Types.ObjectId(userId),
      enterpriseId: new Types.ObjectId(enterpriseId),
    });

    return knowledge;
  }

  async findAll(enterpriseId: string) {
    if (!enterpriseId) {
      throw new BadRequestException('请先选择或切换到一家企业');
    }

    return this.knowledgeModel
      .find({ enterpriseId: new Types.ObjectId(enterpriseId) })
      .populate('creatorId', 'email profile')
      .sort({ createdAt: -1 });
  }

  async findOne(enterpriseId: string, id: string) {
    if (!enterpriseId) {
      throw new BadRequestException('请先选择或切换到一家企业');
    }

    const knowledge = await this.knowledgeModel.findOne({
      _id: id,
      enterpriseId: new Types.ObjectId(enterpriseId),
    }).populate('creatorId', 'email profile');

    if (!knowledge) {
      throw new NotFoundException('知识库不存在或无权访问');
    }

    return knowledge;
  }

  async update(userId: string, enterpriseId: string, id: string, dto: UpdateKnowledgeDto) {
    await this.checkPermission(userId, enterpriseId, id);

    const knowledge = await this.knowledgeModel.findByIdAndUpdate(id, dto, { new: true });
    return knowledge;
  }

  async ingestText(userId: string, enterpriseId: string, knowledgeId: string, content: string) {
    // 1. 权限校验
    await this.checkPermission(userId, enterpriseId, knowledgeId);

    // 2. 调用 agent 层的能力进行切片和向量化入库
    const result = await ingestDocument(content, {
      enterpriseId,
      knowledgeId,
    });

    return {
      message: `成功入库，共生成 ${result.chunks} 个向量切片`,
      ...result,
    };
  }

  async remove(userId: string, enterpriseId: string, id: string) {
    const knowledge = await this.findOne(enterpriseId, id);

    // TODO: 未来可以在此处同步删除 Pinecone 中的 namespace 以防孤儿数据
    // 目前仅删除 MongoDB 中的引用记录
    await this.knowledgeModel.findByIdAndDelete(knowledge._id);

    return { success: true };
  }

  async getRecords(enterpriseId: string, knowledgeId: string): Promise<any[]> {
    // 首先校验归属权限
    await this.findOne(enterpriseId, knowledgeId);
    
    // 调用底层库暴露的方法
    const { listKnowledgeRecords } = await import('@brand-flow/agent');
    const records = await listKnowledgeRecords(knowledgeId);
    return records;
  }

  private async checkPermission(userId: string, enterpriseId: string, knowledgeId: string) {
    if (!enterpriseId) {
      throw new BadRequestException('请先选择或切换到一家企业');
    }

    const knowledge = await this.knowledgeModel.findOne({
      _id: knowledgeId,
      enterpriseId: new Types.ObjectId(enterpriseId),
    });

    if (!knowledge) {
      throw new NotFoundException('知识库不存在或无权访问');
    }

    // 判断权限: 如果不是本人创建的，需要具有当前企业的 OWNER/ADMIN 权限
    if (knowledge.creatorId.toString() !== userId) {
      const user = await this.userModel.findById(userId);
      const membership = user?.memberships.find(
        (m) => m.enterpriseId.toString() === enterpriseId && !m.teamId
      );

      if (!membership || (membership.role !== Role.OWNER && membership.role !== Role.ADMIN)) {
        throw new BadRequestException('您无权操作此知识库');
      }
    }

    return knowledge;
  }
}
