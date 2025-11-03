# Установка и запуск

## Требования

- Node.js 22
- pnpm
- Docker (опционально)

## Переменные окружения

Минимально для провайдеров:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`

Опционально:

- `OPENAI_BASE_URL` (по умолчанию `https://api.openai.com`)
- `ANTHROPIC_BASE_URL` (по умолчанию `https://api.anthropic.com`)
- `ANTHROPIC_API_VERSION` (по умолчанию `2023-06-01`)
- `DEEPSEEK_BASE_URL` (по умолчанию `https://api.deepseek.com`)

## Локальный запуск

```bash
pnpm install
pnpm start:dev
```

Сервис поднимется на `http://0.0.0.0:80/api/v1` (см. `env.production.example`).

## Docker

```bash
docker build -t llm-gateway:local .
docker run --rm -p 8080:80 \
  -e OPENAI_API_KEY=... \
  -e ANTHROPIC_API_KEY=... \
  -e DEEPSEEK_API_KEY=... \
  llm-gateway:local
```
