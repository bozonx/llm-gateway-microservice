import { Injectable, BadRequestException } from '@nestjs/common';
import type { Provider } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';
import { OpenAiAdapter } from './openai.adapter';
import { AnthropicAdapter } from './anthropic.adapter';
import { DeepSeekAdapter } from './deepseek.adapter';
import { OpenRouterAdapter } from './openrouter.adapter';

@Injectable()
export class ProviderRegistry {
  constructor(
    private readonly openai: OpenAiAdapter,
    private readonly anthropic: AnthropicAdapter,
    private readonly deepseek: DeepSeekAdapter,
    private readonly openrouter: OpenRouterAdapter,
  ) {}

  public get(provider: Provider): LlmProviderAdapter {
    switch (provider) {
      case 'openai':
        return this.openai;
      case 'anthropic':
        return this.anthropic;
      case 'deepseek':
        return this.deepseek;
      case 'openrouter':
        return this.openrouter;
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }
}
