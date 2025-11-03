import { LlmService } from '@/modules/llm/llm.service';
import type { LlmProviderAdapter } from '@/modules/llm/providers/base.adapter';
import type { ChatRequestDto, ChatResponseDto } from '@/modules/llm/dto/chat.dto';

describe('LlmService', () => {
  it('should route chat to correct adapter via registry', async () => {
    const fakeAdapter: LlmProviderAdapter = {
      async chat(req: ChatRequestDto): Promise<ChatResponseDto> {
        return {
          id: 'id-1',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: req.model,
          choices: [
            { index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' },
          ],
          provider: req.provider,
        };
      },
    };

    const registry = { get: jest.fn().mockReturnValue(fakeAdapter) } as any;
    const service = new LlmService(registry);

    const res = await service.chat({
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hi' }],
    } as any);

    expect(registry.get).toHaveBeenCalledWith('openai');
    expect(res.choices[0].message.content).toBe('ok');
  });
});
