import { DeepSeekAdapter } from '@/modules/llm/providers/deepseek.adapter';
import type { ChatRequestDto } from '@/modules/llm/dto/chat.dto';
import { createMockConfigService } from '@test/helpers/mocks';

describe('DeepSeekAdapter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
    delete (global as any).fetch;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call DeepSeek chat completions and normalize response', async () => {
    const config = createMockConfigService({
      'llm': {
        requestTimeoutSec: 60,
        defaultMaxTokens: 1024,
        deepseekApiKey: 'deepseek-key',
        deepseekBaseUrl: 'https://api.deepseek.com',
      },
    });
    const adapter = new DeepSeekAdapter(config as any);

    (global as any).fetch = jest.fn(async (url: string, init: any) => {
      expect(url).toMatch(/\/chat\/completions$/);
      const payload = JSON.parse(init.body);
      expect(payload.model).toBe('deepseek-chat');
      expect(payload.messages[0]).toEqual({ role: 'user', content: 'Hi' });
      expect(init.headers.Authorization).toBe('Bearer deepseek-key');

      const json = {
        id: 'deepseek-123',
        model: 'deepseek-chat',
        choices: [
          { message: { role: 'assistant', content: 'Hello DS' }, finish_reason: 'stop' },
        ],
        usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 },
      };
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify(json);
        },
      } as any;
    });

    const req: ChatRequestDto = {
      provider: 'deepseek',
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hi' }],
    } as any;

    const res = await adapter.chat(req);
    expect(res.provider).toBe('deepseek');
    expect(res.choices[0].message.content).toBe('Hello DS');
    expect(res.usage?.total_tokens).toBe(5);
  });

  it('should throw when DEEPSEEK_API_KEY is missing', async () => {
    const config = createMockConfigService({ 'llm': { requestTimeoutSec: 60, defaultMaxTokens: 1024 } });
    const adapter = new DeepSeekAdapter(config as any);
    await expect(
      adapter.chat({ provider: 'deepseek', model: 'x', messages: [{ role: 'user', content: 'Hi' }] } as any),
    ).rejects.toThrow(/DEEPSEEK_API_KEY/);
  });
});
