import { ProviderRegistry } from '@/modules/llm/providers/provider-registry';
import { OpenAiAdapter } from '@/modules/llm/providers/openai.adapter';
import { AnthropicAdapter } from '@/modules/llm/providers/anthropic.adapter';
import { DeepSeekAdapter } from '@/modules/llm/providers/deepseek.adapter';
import { BadRequestException } from '@nestjs/common';
import { createMockConfigService } from '@test/helpers/mocks';

describe('ProviderRegistry', () => {
  it('should return correct adapter by provider', () => {
    const config = createMockConfigService({
      'llm': {
        requestTimeoutSec: 60,
        defaultMaxTokens: 1024,
        openaiApiKey: 'k', openaiBaseUrl: 'https://api.openai.com',
        anthropicApiKey: 'k', anthropicBaseUrl: 'https://api.anthropic.com', anthropicApiVersion: '2023-06-01',
        deepseekApiKey: 'k', deepseekBaseUrl: 'https://api.deepseek.com',
        openrouterApiKey: 'k', openrouterBaseUrl: 'https://openrouter.ai/api',
      },
    });
    const openai = new OpenAiAdapter(config as any);
    const anthropic = new AnthropicAdapter(config as any);
    const deepseek = new DeepSeekAdapter(config as any);
    const { OpenRouterAdapter } = require('@/modules/llm/providers/openrouter.adapter');
    const openrouter = new OpenRouterAdapter(config as any);
    const registry = new ProviderRegistry(openai, anthropic, deepseek, openrouter);

    expect(registry.get('openai')).toBe(openai);
    expect(registry.get('anthropic')).toBe(anthropic);
    expect(registry.get('deepseek')).toBe(deepseek);
    expect(registry.get('openrouter')).toBe(openrouter);
  });

  it('should throw on unsupported provider', () => {
    const registry = new ProviderRegistry({} as any, {} as any, {} as any, {} as any);
    expect(() => registry.get('' as any)).toThrow(BadRequestException);
  });
});
