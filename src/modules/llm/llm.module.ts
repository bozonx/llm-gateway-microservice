import { Module } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { ProviderRegistry } from './providers/provider-registry';
import { OpenAiAdapter } from './providers/openai.adapter';
import { AnthropicAdapter } from './providers/anthropic.adapter';
import { DeepSeekAdapter } from './providers/deepseek.adapter';

@Module({
  controllers: [LlmController],
  providers: [LlmService, ProviderRegistry, OpenAiAdapter, AnthropicAdapter, DeepSeekAdapter],
})
export class LlmModule {}
