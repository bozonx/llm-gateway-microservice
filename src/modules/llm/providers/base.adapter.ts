import type { ChatRequestDto, ChatResponseDto } from '../dto/chat.dto';

export interface LlmProviderAdapter {
  chat(request: ChatRequestDto): Promise<ChatResponseDto>;
}
