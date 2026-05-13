# IELTS Practice App

This project is a Vite + React + TypeScript app with:

- IELTS course modules and quiz buckets
- Chat assistant with image/file analysis
- PostgreSQL-backed curriculum import endpoint
- Bundled local LLM runtime via Docker Compose (Ollama)

## Run with Bundled LLM (No Separate Ollama Install)

From the workspace root:

```bash
npm run infra:up
```

This starts:

- PostgreSQL (`postgres_ielts123`)
- Ollama server (`ollama_local`)
- Auto model pull job (`ollama_model_init`) for:
  - `gemma3:4b`
  - `llava:latest`

Then start the app:

```bash
npm run dev
```

The chat page uses `/api/ollama/generate` through the Vite proxy middleware.

## Stop Infrastructure

```bash
npm run infra:down
```

## Build

```bash
npm run build
```

## Notes

- You do not need a separately installed Ollama daemon for this setup.
- Models are still stored on disk inside Docker volume `ollama_data`.
- First startup can take time while models download.
