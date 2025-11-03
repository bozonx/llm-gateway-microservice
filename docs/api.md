# API

## `POST /api/v1/llm/chat`

Тело запроса (OpenAI-совместимо, с дополнительными полями):

```json
{
  "provider": "openai | anthropic | deepseek",
  "model": "gpt-4o-mini | claude-3-5-sonnet-latest | deepseek-chat",
  "messages": [
    {"role": "system", "content": "You are ..."},
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.2,
  "top_p": 1,
  "max_tokens": 1024,
  "metadata": {"traceId": "optional"},
  "providerOptions": {"any": "native provider params"}
}
```

Ответ:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1730650000,
  "model": "...",
  "choices": [
    {"index": 0, "message": {"role": "assistant", "content": "..."}, "finish_reason": "stop"}
  ],
  "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
  "provider": "openai | anthropic | deepseek"
}
```

### Примечания по провайдерам

- **OpenAI**: совместим с `/v1/chat/completions`. Требуется `OPENAI_API_KEY`.
- **DeepSeek**: OpenAI-совместимый эндпоинт `/v1/chat/completions`. Требуется `DEEPSEEK_API_KEY`.
- **Anthropic**: эндпоинт `/v1/messages`. `system` собирается из всех сообщений роли `system` и передаётся отдельным полем. Требуется `ANTHROPIC_API_KEY`, заголовок `anthropic-version` (см. `ANTHROPIC_API_VERSION`).

### Примеры

```bash
curl -s http://localhost:80/api/v1/llm/chat \
  -H 'content-type: application/json' \
  -d '{
    "provider":"openai",
    "model":"gpt-4o-mini",
    "messages":[{"role":"user","content":"Hello"}],
    "max_tokens":64
  }'
```

```bash
curl -s http://localhost:80/api/v1/llm/chat \
  -H 'content-type: application/json' \
  -d '{
    "provider":"anthropic",
    "model":"claude-3-5-sonnet-latest",
    "messages":[{"role":"system","content":"You are helpful"},{"role":"user","content":"Hello"}],
    "max_tokens":64
  }'
```

```bash
curl -s http://localhost:80/api/v1/llm/chat \
  -H 'content-type: application/json' \
  -d '{
    "provider":"deepseek",
    "model":"deepseek-chat",
    "messages":[{"role":"user","content":"Hello"}],
    "max_tokens":64
  }'
```
