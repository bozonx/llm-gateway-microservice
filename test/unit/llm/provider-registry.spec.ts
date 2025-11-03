import { ProviderRegistry } from '@/modules/llm/providers/provider-registry';
import { OpenAiAdapter } from '@/modules/llm/providers/openai.adapter';
import { AnthropicAdapter } from '@/modules/llm/providers/anthropic.adapter';
import { DeepSeekAdapter } from '@/modules/llm/providers/deepseek.adapter';
import { BadRequestException } from '@nestjs/common';

describe('ProviderRegistry', () => {
  it('should return correct adapter by provider', () => {
    const openai = new OpenAiAdapter();
    const anthropic = new AnthropicAdapter();
    const deepseek = new DeepSeekAdapter();
    const openrouter = new (require('@/modules/llm/providers/openrouter.adapter').OpenRouterAdapter)();
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
