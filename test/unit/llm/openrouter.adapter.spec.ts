import { OpenRouterAdapter } from '@/modules/llm/providers/openrouter.adapter';
import type { ChatRequestDto } from '@/modules/llm/dto/chat.dto';

describe('OpenRouterAdapter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
    process.env.OPENROUTER_API_KEY = 'openrouter-key';
    delete (global as any).fetch;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call OpenRouter chat completions and normalize response', async () => {
    const adapter = new OpenRouterAdapter();

    (global as any).fetch = jest.fn(async (url: string, init: any) => {
      expect(url).toMatch(/\/v1\/chat\/completions$/);
      const payload = JSON.parse(init.body);
      expect(payload.model).toBe('openrouter/auto');
      expect(payload.messages[0]).toEqual({ role: 'user', content: 'Hi' });
      expect(init.headers.Authorization).toBe('Bearer openrouter-key');

      const json = {
        id: 'or-123',
        model: 'openrouter/auto',
        choices: [
          { message: { role: 'assistant', content: 'Hello OR' }, finish_reason: 'stop' },
        ],
        usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
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
      provider: 'openrouter',
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: 'Hi' }],
    } as any;

    const res = await adapter.chat(req);
    expect(res.provider).toBe('openrouter');
    expect(res.choices[0].message.content).toBe('Hello OR');
    expect(res.usage?.total_tokens).toBe(7);
  });

  it('should throw when OPENROUTER_API_KEY is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const adapter = new OpenRouterAdapter();
    await expect(
      adapter.chat({ provider: 'openrouter', model: 'x', messages: [{ role: 'user', content: 'Hi' }] } as any),
    ).rejects.toThrow(/OPENROUTER_API_KEY/);
  });
});
