import { OpenAiAdapter } from '@/modules/llm/providers/openai.adapter';
import type { ChatRequestDto } from '@/modules/llm/dto/chat.dto';

describe('OpenAiAdapter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
    process.env.OPENAI_API_KEY = 'test-key';
    delete (global as any).fetch;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call OpenAI chat completions and normalize response', async () => {
    const adapter = new OpenAiAdapter();

    const bodyCaptured: any[] = [];
    (global as any).fetch = jest.fn(async (url: string, init: any) => {
      bodyCaptured.push({ url, init });
      const json = {
        id: 'chatcmpl-123',
        model: 'gpt-4o-mini',
        choices: [
          {
            message: { role: 'assistant', content: 'Hello' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
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
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 64,
      temperature: 0.2,
      top_p: 1,
      providerOptions: { presence_penalty: 0 },
    } as any;

    const res = await adapter.chat(req);

    expect(res.provider).toBe('openai');
    expect(res.model).toBe('gpt-4o-mini');
    expect(res.choices[0].message.content).toBe('Hello');
    expect(res.usage?.total_tokens).toBe(3);

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toMatch(/\/v1\/chat\/completions$/);
    const payload = JSON.parse(call[1].body);
    expect(payload.model).toBe('gpt-4o-mini');
    expect(payload.messages[0]).toEqual({ role: 'user', content: 'Hi' });
    expect(payload.max_tokens).toBe(64);
    expect(payload.temperature).toBe(0.2);
    expect(payload.top_p).toBe(1);
    expect(payload.presence_penalty).toBe(0);
    expect(call[1].headers.Authorization).toBe('Bearer test-key');
  });

  it('should throw when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const adapter = new OpenAiAdapter();
    await expect(
      adapter.chat({ provider: 'openai', model: 'x', messages: [{ role: 'user', content: 'Hi' }] } as any),
    ).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
