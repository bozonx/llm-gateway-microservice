import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChatRequestDto, ChatResponseDto, ChatMessageDto } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';
import type { LlmConfig } from '@/config/llm.config';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';

function splitSystem(messages: ChatMessageDto[]): { system?: string; rest: ChatMessageDto[] } {
  const systemParts: string[] = [];
  const rest: ChatMessageDto[] = [];
  for (const m of messages) {
    if (m.role === 'system') systemParts.push(m.content);
    else rest.push(m);
  }
  return { system: systemParts.length ? systemParts.join('\n') : undefined, rest };
}

@Injectable()
export class AnthropicAdapter implements LlmProviderAdapter {
  constructor(private readonly configService: ConfigService) {}

  public async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const llm = this.configService.get<LlmConfig>('llm')!;
    const apiKey = llm.anthropicApiKey;
    if (!apiKey) {
      throw new HttpException('ANTHROPIC_API_KEY is not configured', 500);
    }
    const baseUrl = llm.anthropicBaseUrl;
    const version = llm.anthropicApiVersion;
    const timeoutMs = (llm.requestTimeoutSec ?? 60) * 1000;

    const { system, rest } = splitSystem(request.messages);

    const body: Record<string, unknown> = {
      model: request.model,
      messages: rest.map(m => ({
        role: m.role,
        content: [{ type: 'text', text: m.content }],
      })),
      max_tokens: typeof request.max_tokens === 'number' ? request.max_tokens : llm.defaultMaxTokens,
    };
    if (system) body.system = system;
    if (typeof request.temperature === 'number') body.temperature = request.temperature;
    if (typeof request.top_p === 'number') body.top_p = request.top_p;

    if (request.providerOptions && typeof request.providerOptions === 'object') {
      Object.assign(body, request.providerOptions);
    }

    const res = await fetchWithTimeout(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': version,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    }, timeoutMs);

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { /* keep text */ }

    if (!res.ok) {
      const message = json?.error?.message || text || 'Anthropic API error';
      throw new HttpException(message, res.status);
    }

    const usage = json?.usage ?? {};
    const contentText = Array.isArray(json?.content)
      ? json.content.map((p: any) => (p?.text ?? '')).join('')
      : (json?.content?.[0]?.text ?? '');

    const response: ChatResponseDto = {
      id: json?.id ?? '',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: contentText },
          finish_reason: json?.stop_reason ?? null,
        },
      ],
      usage: {
        prompt_tokens: usage?.input_tokens,
        completion_tokens: usage?.output_tokens,
        total_tokens: typeof usage?.input_tokens === 'number' && typeof usage?.output_tokens === 'number'
          ? usage.input_tokens + usage.output_tokens
          : undefined,
      },
      provider: 'anthropic',
    };

    return response;
  }
}
