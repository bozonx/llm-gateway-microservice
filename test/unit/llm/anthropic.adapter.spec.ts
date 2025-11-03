import { AnthropicAdapter } from '@/modules/llm/providers/anthropic.adapter';
import type { ChatRequestDto } from '@/modules/llm/dto/chat.dto';
import { createMockConfigService } from '@test/helpers/mocks';

describe('AnthropicAdapter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
    delete (global as any).fetch;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should call Anthropic messages API and normalize response', async () => {
    const config = createMockConfigService({
      'llm': {
        requestTimeoutSec: 60,
        defaultMaxTokens: 1024,
        anthropicApiKey: 'anthropic-key',
        anthropicBaseUrl: 'https://api.anthropic.com',
        anthropicApiVersion: '2023-06-01',
      },
    });
    const adapter = new AnthropicAdapter(config as any);

    (global as any).fetch = jest.fn(async (_url: string, init: any) => {
      const req = JSON.parse(init.body);
      expect(req.model).toBe('claude-3-5-sonnet-latest');
      expect(req.messages[0]).toEqual({
        role: 'user',
        content: [{ type: 'text', text: 'Hi' }],
      });
      expect(init.headers['x-api-key']).toBe('anthropic-key');
      expect(init.headers['anthropic-version']).toBe('2023-06-01');

      const json = {
        id: 'msg_123',
        content: [{ type: 'text', text: 'Hello from Claude' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 5, output_tokens: 7 },
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
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hi' },
      ],
      max_tokens: 64,
    } as any;

    const res = await adapter.chat(req);

    expect(res.provider).toBe('anthropic');
    expect(res.choices[0].message.content).toMatch('Hello from Claude');
    expect(res.usage?.total_tokens).toBe(12);
  });

  it('should throw when ANTHROPIC_API_KEY is missing', async () => {
    const config = createMockConfigService({ 'llm': { requestTimeoutSec: 60, defaultMaxTokens: 1024, anthropicApiVersion: '2023-06-01', anthropicBaseUrl: 'https://api.anthropic.com' } });
    const adapter = new AnthropicAdapter(config as any);
    await expect(
      adapter.chat({ provider: 'anthropic', model: 'x', messages: [{ role: 'user', content: 'Hi' }] } as any),
    ).rejects.toThrow(/ANTHROPIC_API_KEY/);
  });
});
