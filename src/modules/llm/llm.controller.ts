import { Body, Controller, Post } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ChatRequestDto } from './dto/chat.dto';

@Controller('llm')
export class LlmController {
  constructor(private readonly service: LlmService) {}

  @Post('chat')
  public async chat(@Body() body: ChatRequestDto) {
    return this.service.chat(body);
  }
}
