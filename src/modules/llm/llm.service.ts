import { Injectable } from '@nestjs/common';
import { ProviderRegistry } from './providers/provider-registry';
import type { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class LlmService {
  constructor(private readonly registry: ProviderRegistry) {}

  public async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const adapter = this.registry.get(request.provider);
    return adapter.chat(request);
  }
}
