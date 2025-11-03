import { Injectable, BadRequestException } from '@nestjs/common';
import type { Provider } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';
import { OpenAiAdapter } from './openai.adapter';
import { AnthropicAdapter } from './anthropic.adapter';
import { DeepSeekAdapter } from './deepseek.adapter';

@Injectable()
export class ProviderRegistry {
  constructor(
    private readonly openai: OpenAiAdapter,
    private readonly anthropic: AnthropicAdapter,
    private readonly deepseek: DeepSeekAdapter,
  ) {}

  public get(provider: Provider): LlmProviderAdapter {
    switch (provider) {
      case 'openai':
        return this.openai;
      case 'anthropic':
        return this.anthropic;
      case 'deepseek':
        return this.deepseek;
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }
}
