# OpenRouter Chat Tester

Minimal local app for quickly testing OpenRouter chat models. Paste your API key, pick a model, chat.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

1. Paste your OpenRouter API key in the input field.
2. Click **Load Models** (or press Enter).
3. Select a model from the dropdown.
4. Type a message and hit **Send** (or press Enter).
5. Optionally set a system prompt or toggle streaming on/off.
6. Click **Clear Chat** to reset the conversation.

Nothing is persisted — refreshing the page clears everything.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (`dist/`) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Stack

- Vite + React + TypeScript
- Frontend-only (no backend needed)
- API calls go directly to OpenRouter from the browser

## Requirements

- Node.js 18+
- An [OpenRouter](https://openrouter.ai/) API key
