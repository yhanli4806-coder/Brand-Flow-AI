import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeDocument = Knowledge & Document;

@Schema({ timestamps: true })
export class Knowledge {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Enterprise', required: true })
  enterpriseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId!: Types.ObjectId;

  // 预留对接向量检索空间标识
  @Prop()
  pineconeNamespace!: string;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);
