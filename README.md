# LLM Gateway Microservice (NestJS + Fastify)

Production-ready microservice providing unified access to multiple LLM providers via an OpenAI-compatible API. Built with NestJS + Fastify.

## Features

- Health-check endpoint `/{API_BASE_PATH}/v1/health`
- Pino logging (JSON in production)
- Global error filter
- Fastify HTTP server
- Jest tests (unit and e2e)
- Docker-ready

## Production Quick Start

Requirements:

- Node.js 22+
- pnpm 10+

```bash
# 1) Install dependencies
pnpm install

# 2) Prepare environment (production)
cp env.production.example .env.production
# Set provider API keys (e.g., OPENAI_API_KEY / ANTHROPIC_API_KEY / DEEPSEEK_API_KEY)
# optionally override *_BASE_URL and ANTHROPIC_API_VERSION

# 3) Build and run (production)
pnpm build
pnpm start:prod
```

Default URL (prod): `http://localhost:80/api/v1`
Docker Compose: `http://localhost:8080/api/v1`

## Environment Variables

Source of truth: `.env.production.example` (copy to `.env.production`).

- Service basics
  - `NODE_ENV` — `production|development|test`
  - `LISTEN_HOST` — e.g., `0.0.0.0`
  - `LISTEN_PORT` — e.g., `80`
  - `API_BASE_PATH` — API prefix (default `api`)
  - `LOG_LEVEL` — `trace|debug|info|warn|error|fatal|silent`
  - `TZ` — timezone (default `UTC`)

- LLM providers (set keys for the providers you use)
  - OpenAI: `OPENAI_API_KEY`, optional `OPENAI_BASE_URL` (default `https://api.openai.com`)
  - Anthropic: `ANTHROPIC_API_KEY`, optional `ANTHROPIC_BASE_URL` (default `https://api.anthropic.com`), `ANTHROPIC_API_VERSION` (default `2023-06-01`)
  - DeepSeek: `DEEPSEEK_API_KEY`, optional `DEEPSEEK_BASE_URL` (default `https://api.deepseek.com`)
  - OpenRouter: `OPENROUTER_API_KEY`, optional `OPENROUTER_BASE_URL` (default `https://openrouter.ai/api`)

## Endpoints

- `GET /{API_BASE_PATH}/v1/health`
- `POST /{API_BASE_PATH}/v1/llm/chat`

## LLM Gateway

Unified access to LLMs via an OpenAI-compatible contract.

- Endpoint: `POST /{API_BASE_PATH}/v1/llm/chat`
- v1 Providers: `openai`, `anthropic`, `deepseek`, `openrouter`
- Streaming responses: not available in v1

## Documentation

- [API](./docs/api.md)

## Tests
Run unit and e2e tests:
```bash
pnpm test:unit
pnpm test:e2e
```

## Deploy with Docker (prod)

Option 1 — local image:

```bash
docker build -t llm-gateway:prod .
docker run --rm -p 8080:80 \
  -e OPENAI_API_KEY=... \
  -e ANTHROPIC_API_KEY=... \
  -e DEEPSEEK_API_KEY=... \
  -e OPENROUTER_API_KEY=... \
  llm-gateway:prod
```

After start: `http://localhost:8080/api/v1/health`

Option 2 — Docker Compose (see `docker/docker-compose.yml`).

# Development guide

See repository docs and code comments. All documentation is in English as per project guidelines.

## Environment variable notes
- `HTTP_REQUEST_BODY_LIMIT_MB` — max HTTP request body size in megabytes for Fastify body parser. Default: `10` (MB).

## License

MIT
