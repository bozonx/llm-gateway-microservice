import { Injectable, HttpException } from '@nestjs/common';
import type { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';

@Injectable()
export class DeepSeekAdapter implements LlmProviderAdapter {
  public async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new HttpException('DEEPSEEK_API_KEY is not configured', 500);
    }
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map(m => ({ role: m.role, content: m.content })),
    };

    if (typeof request.temperature === 'number') body.temperature = request.temperature;
    if (typeof request.top_p === 'number') body.top_p = request.top_p;
    if (typeof request.max_tokens === 'number') body.max_tokens = request.max_tokens;

    if (request.providerOptions && typeof request.providerOptions === 'object') {
      Object.assign(body, request.providerOptions);
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { /* keep text */ }

    if (!res.ok) {
      const message = json?.error?.message || text || 'DeepSeek API error';
      throw new HttpException(message, res.status);
    }

    const usage = json?.usage ?? {};
    const content = json?.choices?.[0]?.message?.content ?? '';

    const response: ChatResponseDto = {
      id: json?.id ?? '',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: json?.model ?? request.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content },
          finish_reason: json?.choices?.[0]?.finish_reason ?? null,
        },
      ],
      usage: {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      },
      provider: 'deepseek',
    };

    return response;
  }
}
