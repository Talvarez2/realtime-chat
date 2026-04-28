# AGENTS.md

## Project Overview

Real-time chat application using WebSockets, Express, and SQLite. Vanilla JS frontend, no frameworks.

## Structure

- `server.js` — Express HTTP server, mounts WebSocket handler
- `src/ws.js` — WebSocket logic: rooms, broadcasting, typing, message routing
- `src/db.js` — SQLite persistence: messages table, save/load
- `public/index.html` — Chat UI with sidebar (rooms, users) and main chat area
- `public/js/chat.js` — WebSocket client, markdown rendering, typing indicators
- `public/js/emoji.js` — Emoji picker widget
- `public/css/style.css` — Dark theme, chat bubbles, sidebar layout

## Conventions

- All WebSocket messages are JSON with a `type` field
- Message types: `join`, `message`, `typing`, `system`, `joined`, `history`, `rooms`, `users`
- Rooms are in-memory (Map of Sets); messages persist in SQLite
- Markdown rendering is client-side (bold, italic, inline code)
- Emoji shortcodes are expanded client-side

## Running

```bash
npm install && npm start   # http://localhost:3000
docker compose up --build  # Docker alternative
```
