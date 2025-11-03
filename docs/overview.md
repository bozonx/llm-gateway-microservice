# Обзор

Этот микросервис предоставляет унифицированный доступ к LLM через OpenAI-совместный контракт.

- Транспорт: HTTP (NestJS + Fastify)
- Точка входа: `POST /api/v1/llm/chat`
- Поддерживаемые провайдеры v1: `openai`, `anthropic`, `deepseek`, `openrouter`
- Потоковые ответы (stream) в v1: отсутствуют
- Авторизация, CORS, rate limiting: реализуются на API Gateway (не здесь)

## Архитектура

- Модуль `LlmModule` с контроллером, сервисом и реестром провайдеров
- Адаптеры провайдеров инкапсулируют вызовы API и маппинг форматов
- Валидация входа через `class-validator`

## Формат ответа

Ответ нормализуется под OpenAI Chat Completions (упрощённый):

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1730650000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {"role": "assistant", "content": "..."},
      "finish_reason": "stop"
    }
  ],
  "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
  "provider": "openai"
}
```

## Ограничения

- Нет потоковой передачи (можно добавить в следующей версии)
- `providerOptions` пробрасываются как есть; ответственность за корректность на вызывающей стороне
