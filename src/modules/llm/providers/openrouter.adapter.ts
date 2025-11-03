import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';
import type { LlmConfig } from '@/config/llm.config';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';

@Injectable()
export class OpenRouterAdapter implements LlmProviderAdapter {
  constructor(private readonly configService: ConfigService) {}

  public async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const llm = this.configService.get<LlmConfig>('llm')!;
    const apiKey = llm.openrouterApiKey;
    if (!apiKey) {
      throw new HttpException('OPENROUTER_API_KEY is not configured', 500);
    }
    const baseUrl = llm.openrouterBaseUrl;
    const timeoutMs = (llm.requestTimeoutSec ?? 60) * 1000;

    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map(m => ({ role: m.role, content: m.content })),
    };

    if (typeof request.temperature === 'number') body.temperature = request.temperature;
    if (typeof request.top_p === 'number') body.top_p = request.top_p;
    if (typeof request.max_tokens === 'number') body.max_tokens = request.max_tokens;
    else body.max_tokens = llm.defaultMaxTokens;

    if (request.providerOptions && typeof request.providerOptions === 'object') {
      Object.assign(body, request.providerOptions);
    }

    const res = await fetchWithTimeout(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }, timeoutMs);

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { /* keep text */ }

    if (!res.ok) {
      const message = json?.error?.message || text || 'OpenRouter API error';
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
      provider: 'openrouter',
    };

    return response;
  }
}
