import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';
import type { LlmProviderAdapter } from './base.adapter';
import type { LlmConfig } from '@/config/llm.config';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';

@Injectable()
export class DeepSeekAdapter implements LlmProviderAdapter {
  constructor(private readonly configService: ConfigService) {}

  public async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const llm = this.configService.get<LlmConfig>('llm')!;
    const apiKey = llm.deepseekApiKey;
    if (!apiKey) {
      throw new HttpException('DEEPSEEK_API_KEY is not configured', 500);
    }
    const baseUrl = llm.deepseekBaseUrl;
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

    let res: Response;
    try {
      res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }, timeoutMs);
    } catch (e: any) {
      const isAbort = e?.name === 'AbortError' || /aborted|timed out/i.test(String(e?.message ?? ''));
      throw new HttpException(isAbort ? 'DeepSeek request timed out' : 'DeepSeek request failed', isAbort ? 504 : 502);
    }

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { /* keep text */ }

    if (!res.ok) {
      const message = json?.error?.message || text || 'DeepSeek API error';
      const status = res.status;
      const mapped = status >= 500 ? 502 : (status === 408 ? 504 : (status === 429 ? 429 : (status === 401 || status === 403 ? status : status)));
      throw new HttpException(message, mapped);
    }

    const usage = json?.usage ?? {};
    const content = json?.choices?.[0]?.message?.content ?? '';

    const response: ChatResponseDto = {
      id: json?.id ?? '',
      object: 'chat.completion',
      created: typeof json?.created === 'number' ? json.created : Math.floor(Date.now() / 1000),
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
