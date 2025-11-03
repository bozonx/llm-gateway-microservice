import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from './test-app.factory';
import http from 'http';

function startStubServer(handler: (req: http.IncomingMessage, body: any, res: http.ServerResponse) => void): Promise<{ server: http.Server, url: string }> {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        let json: any = undefined;
        try { json = data ? JSON.parse(data) : undefined; } catch {}
        handler(req, json, res);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (typeof address === 'object' && address && address.port) {
        resolve({ server, url: `http://127.0.0.1:${address.port}` });
      }
    });
  });
}

describe('LLM (e2e)', () => {
  let app: NestFastifyApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/llm/chat openai -> normalizes response', async () => {
    const { server, url } = await startStubServer((_req, body, res) => {
      expect(body.model).toBe('gpt-4o-mini');
      expect(body.messages?.[0]).toEqual({ role: 'user', content: 'Hi' });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        id: 'chatcmpl-1',
        model: 'gpt-4o-mini',
        choices: [ { message: { role: 'assistant', content: 'Hello' }, finish_reason: 'stop' } ],
        usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
      }));
    });

    // Configure env before app init
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_BASE_URL = url;

    app = await createTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/llm/chat',
      payload: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [ { role: 'user', content: 'Hi' } ],
      },
    });

    await new Promise(resolve => server.close(resolve));

    expect(response.statusCode).toBe(201); // Nest default for POST
    const body = JSON.parse(response.body);
    expect(body.provider).toBe('openai');
    expect(body.object).toBe('chat.completion');
    expect(body.choices?.[0]?.message?.content).toBe('Hello');
    expect(body.usage?.total_tokens).toBe(3);
  });
});
