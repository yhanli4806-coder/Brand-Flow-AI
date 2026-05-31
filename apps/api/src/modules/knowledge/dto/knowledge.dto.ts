import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  pineconeNamespace?: string;
}

export class UpdateKnowledgeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  pineconeNamespace?: string;
}

export class IngestKnowledgeDto {
  @IsString()
  @IsNotEmpty({ message: '文本内容不能为空' })
  content!: string;
}
