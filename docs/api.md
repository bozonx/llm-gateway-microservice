# API

Base path is configured as `/{API_BASE_PATH}/v1` (see `.env.production.example`, default base path is `api`).

## GET `/{API_BASE_PATH}/v1/health`

Simple health check.

Response (200 OK):

```json
{ "status": "ok" }
```

## POST `/{API_BASE_PATH}/v1/llm/chat`

OpenAI-compatible chat endpoint (Chat Completions) with minor extensions. Note: OpenAI's modern Responses API is not used in v1; migration can be considered in a future version.

The `created` field reflects the provider's timestamp when available; otherwise, the current server time is used.

Request body:

```json
{
  "provider": "openai | anthropic | deepseek | openrouter",
  "model": "gpt-4o-mini | claude-3-5-sonnet-latest | deepseek-chat | openrouter/auto",
  "messages": [
    { "role": "system", "content": "You are ..." },
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.2,
  "top_p": 1,
  "max_tokens": 1024,
  "metadata": { "traceId": "optional" },
  "providerOptions": { "any": "native provider params" }
}
```

Response (201 Created):

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1730650000,
  "model": "...",
  "choices": [
    { "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }
  ],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 },
  "provider": "openai | anthropic | deepseek | openrouter"
}
```

Notes by provider:

- OpenAI: uses `/v1/chat/completions`. Requires `OPENAI_API_KEY`.
- DeepSeek: `/chat/completions` (OpenAI-compatible). Requires `DEEPSEEK_API_KEY`.
- Anthropic: uses `/v1/messages`. All `system` messages are concatenated and sent as a separate `system` field. Requires `ANTHROPIC_API_KEY` and header `anthropic-version` (`ANTHROPIC_API_VERSION`).
- OpenRouter: OpenAI-compatible `/v1/chat/completions` with base URL `https://openrouter.ai/api` by default. Requires `OPENROUTER_API_KEY`.

Examples:

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

```bash
curl -s http://localhost:80/api/v1/llm/chat \
  -H 'content-type: application/json' \
  -d '{
    "provider":"openrouter",
    "model":"openrouter/auto",
    "messages":[{"role":"user","content":"Hello"}],
    "max_tokens":64
  }'
```

Status codes:

- 201 Created — successful chat completion (NestJS default for POST)
- 400 Bad Request — validation errors (DTO + global ValidationPipe)
- 401/403 — provider authentication/authorization failures (propagated)
- 429 — rate limiting from provider (propagated)
- 502 Bad Gateway — upstream provider error
- 504 Gateway Timeout — request to provider timed out
- 5xx — other internal errors (e.g., misconfiguration like missing API keys)

Error response shape (global exception filter):

```json
{
  "statusCode": 400,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/v1/llm/chat",
  "method": "POST",
  "message": "Validation failed: ...",
  "error": {
    "statusCode": 400,
    "message": ["provider must be one of the following values: openai, anthropic, deepseek, openrouter"],
    "error": "Bad Request"
  }
}
```
