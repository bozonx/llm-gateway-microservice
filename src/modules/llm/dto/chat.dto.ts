import { IsArray, IsDefined, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export const PROVIDERS = ['openai', 'anthropic', 'deepseek', 'openrouter'] as const;
export type Provider = (typeof PROVIDERS)[number];

export interface ChatChoiceMessage {
  role: 'assistant';
  content: string;
}

export interface ChatResponseDto {
  id: string;
  object: 'chat.completion';
  created: number; // unix seconds
  model: string;
  choices: Array<{
    index: number;
    message: ChatChoiceMessage;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  provider: Provider;
}

export class ChatMessageDto {
  @IsIn(['system', 'user', 'assistant'])
  public role!: 'system' | 'user' | 'assistant';

  @IsString()
  public content!: string;
}

export class ChatRequestDto {
  @IsIn(PROVIDERS as unknown as string[])
  public provider!: Provider;

  @IsString()
  public model!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  public messages!: ChatMessageDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  public temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  public top_p?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public max_tokens?: number;

  @IsOptional()
  @IsObject()
  public metadata?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  public providerOptions?: Record<string, unknown>;
}
