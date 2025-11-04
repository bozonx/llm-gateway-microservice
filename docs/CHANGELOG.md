# CHANGELOG

## Unreleased
 
 - Docs: translated to English and restructured
   - Consolidated `docs/overview.md` and `docs/setup.md` into `README.md`
   - Optimized README for production usage, added links to API docs and development guide
   - Rewrote `docs/api.md` with request/response examples and status codes
   - Marked `docs/overview.md` and `docs/setup.md` for removal
 
- Removed env var `API_VERSION`; API version is hardcoded as `v1` across the service
- Updated README, documentation, and e2e app factory for `v1`

- README oriented for production usage (dev instructions removed)
- Added `docs/dev.md` with development instructions
- Clarified prod URL and Docker Compose commands in README
- Env section: mention `TZ` and `.env.production.example` as the source of truth
- Added LLM Gateway module (NestJS) with endpoint `POST /api/v1/llm/chat`
- Provider support: `openai`, `anthropic`, `deepseek` (no streaming)
- Normalized responses to OpenAI Chat Completions (simplified format)
- Documentation: `docs/overview.md`, `docs/api.md`, `docs/setup.md`
- Added provider `openrouter` (OpenAI-compatible `/v1/chat/completions`), updated README and docs

## 0.15.0 — Boilerplate refactor

- Removed STT, GraphQL, and Auth features
- Kept only the Health module (simple health-check)
- Simplified environment configs (`.env.*`)
- Updated `AppModule` and logging (service: `nestjs-boilerplate`)
- Cleaned and rebuilt tests (unit + e2e only for health)
- Reworked `docker-compose.yml` to a minimal example (local build)
- Updated `README.md` (Russian)
- Removed outdated documents in `docs/` (STT/Auth/GraphQL)
