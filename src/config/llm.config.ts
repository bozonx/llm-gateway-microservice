import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, IsUrl, Min, Max, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class LlmConfig {
  @IsInt()
  @Min(1)
  @Max(3600)
  requestTimeoutSec!: number;

  @IsInt()
  @Min(1)
  @Max(1000000)
  defaultMaxTokens!: number;

  @IsOptional()
  @IsString()
  openaiApiKey?: string;

  @IsString()
  openaiBaseUrl!: string;

  @IsOptional()
  @IsString()
  anthropicApiKey?: string;

  @IsString()
  anthropicBaseUrl!: string;

  @IsString()
  anthropicApiVersion!: string;

  @IsOptional()
  @IsString()
  deepseekApiKey?: string;

  @IsString()
  deepseekBaseUrl!: string;

  @IsOptional()
  @IsString()
  openrouterApiKey?: string;

  @IsString()
  openrouterBaseUrl!: string;
}

export default registerAs('llm', (): LlmConfig => {
  const cfg = plainToInstance(LlmConfig, {
    requestTimeoutSec: parseInt(process.env.REQUEST_TIMEOUT_SEC ?? '60', 10),
    defaultMaxTokens: parseInt(process.env.LLM_MAX_TOKENS_DEFAULT ?? '1024', 10),

    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com',

    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com',
    anthropicApiVersion: process.env.ANTHROPIC_API_VERSION ?? '2023-06-01',

    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',

    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api',
  });

  const errors = validateSync(cfg, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors.map(e => Object.values(e.constraints ?? {}).join(', '));
    throw new Error(`LLM config validation error: ${messages.join('; ')}`);
  }
  return cfg;
});
