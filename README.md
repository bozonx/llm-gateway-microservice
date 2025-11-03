# LLM Gateway микросервис (NestJS + Fastify)

Микросервис для унифицированного доступа к LLM через OpenAI-совместный API. Основан на NestJS + Fastify.

## Что включено

- 🏥 Простой health-check эндпоинт `/{API_BASE_PATH}/{API_VERSION}/health`
- 📊 Логирование через Pino (JSON в prod)
- 🛡️ Глобальный фильтр ошибок
- ⚡ Fastify
- 🧪 Настроенные Jest-тесты (unit и e2e)
- 🐳 Готовность к работе в Docker

## Быстрый старт (prod)

Требования:

- Node.js 22+
- pnpm 10+

```bash
# 1) Установка зависимостей
pnpm install

# 2) Настройка окружения (prod)
cp env.production.example .env.production
# Установите ключи провайдеров LLM (например, OPENAI_API_KEY / ANTHROPIC_API_KEY / DEEPSEEK_API_KEY)
# при необходимости переопределите *_BASE_URL и ANTHROPIC_API_VERSION

# 3) Сборка и запуск (prod)
pnpm build
pnpm start:prod
```

URL по умолчанию (prod): `http://localhost:80/api/v1`
Для Docker Compose: `http://localhost:8080/api/v1`

## Переменные окружения

Источник истины: `.env.production.example` (скопируйте в `.env.production`).

- Базовые настройки сервиса
  - `NODE_ENV` — `production|development|test`
  - `LISTEN_HOST` — например, `0.0.0.0`
  - `LISTEN_PORT` — например, `80`
  - `API_BASE_PATH` — префикс API (по умолчанию `api`)
  - `API_VERSION` — версия API (по умолчанию `v1`)
  - `LOG_LEVEL` — `trace|debug|info|warn|error|fatal|silent` (в prod используется JSON-логирование)
  - `TZ` — таймзона (по умолчанию `UTC`)

- Провайдеры LLM (установите ключи для используемых провайдеров)
  - OpenAI: `OPENAI_API_KEY`, опц. `OPENAI_BASE_URL` (по умолчанию `https://api.openai.com`)
  - Anthropic: `ANTHROPIC_API_KEY`, опц. `ANTHROPIC_BASE_URL` (по умолчанию `https://api.anthropic.com`), `ANTHROPIC_API_VERSION` (по умолчанию `2023-06-01`)
  - DeepSeek: `DEEPSEEK_API_KEY`, опц. `DEEPSEEK_BASE_URL` (по умолчанию `https://api.deepseek.com`)

## Эндпоинты

- `GET /{API_BASE_PATH}/{API_VERSION}/health`

## LLM Gateway

Унифицированный доступ к LLM через OpenAI-совместный контракт.

- Эндпоинт: `POST /{API_BASE_PATH}/{API_VERSION}/llm/chat`
- Провайдеры v1: `openai`, `anthropic`, `deepseek`
- Потоковые ответы: отсутствуют в v1

Документация:

- [Обзор](./docs/overview.md)
- [API](./docs/api.md)
- [Установка и запуск](./docs/setup.md)

## Тесты
См. инструкции в `docs/dev.md`.

## Деплой через Docker (prod)

Вариант 1 — локальный образ:

```bash
docker build -t llm-gateway:prod .
docker run --rm -p 8080:80 \
  -e OPENAI_API_KEY=... \
  -e ANTHROPIC_API_KEY=... \
  -e DEEPSEEK_API_KEY=... \
  llm-gateway:prod
```

После запуска: `http://localhost:8080/api/v1/health`

Вариант 2 — Docker Compose (см. `docker/docker-compose.yml`).

## Лицензия

MIT
