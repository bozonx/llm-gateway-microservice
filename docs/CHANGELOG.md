# CHANGELOG

## Unreleased

- README ориентирован на production-использование (убраны dev-инструкции)
- Добавлен `docs/dev.md` с инструкциями по разработке и dev-режиму
- Уточнены prod URL и Docker Compose команды в README
- В разделе env добавлено упоминание `TZ` и что источником истины является `.env.production.example`
- Добавлен модуль LLM Gateway (NestJS) с эндпоинтом `POST /api/v1/llm/chat`
- Поддержка провайдеров: `openai`, `anthropic`, `deepseek` (без streaming)
- Нормализация ответа к OpenAI Chat Completions (упрощённый формат)
- Документация: `docs/overview.md`, `docs/api.md`, `docs/setup.md`
- Добавлен провайдер `openrouter` (OpenAI-совместимый `/v1/chat/completions`), обновлены README и документация

## 0.15.0 — Boilerplate refactor

- Полностью удалены функциональности STT, GraphQL и Auth
- Оставлен только модуль Health (простой health-check)
- Упрощены конфиги окружения (`.env.*`)
- Обновлён `AppModule` и логирование (service: `nestjs-boilerplate`)
- Очищены и пересобраны тесты (unit + e2e только для health)
- Переработан `docker-compose.yml` до минимального примера (локальная сборка)
- Обновлён `README.md` (рус.)
- Удалены устаревшие документы в `docs/` (STT/Auth/GraphQL)
