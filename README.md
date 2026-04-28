# Realtime Chat

Real-time chat application built with WebSockets, Express, and SQLite.

![Screenshot](screenshot.png)

## Features

- **Real-time messaging** via WebSockets
- **Chat rooms** — create and switch rooms, `/join #room-name` command
- **User presence** — see who's online in each room
- **Message persistence** — SQLite stores messages, last 50 loaded on join
- **Typing indicators** — see when others are typing
- **Markdown** — bold (`**text**`), italic (`*text*`), inline code (`` `code` ``)
- **Emoji** — picker button + shortcodes (`:fire:`, `:rocket:`, `:)`)
- **System messages** — join/leave notifications

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────┐
│  Browser     │◄──────────────────►│  server.js   │
│  chat.js     │                    │  Express +   │
│  emoji.js    │                    │  ws server   │
└─────────────┘                    └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │  src/ws.js   │
                                   │  rooms, msgs │
                                   └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │  src/db.js   │
                                   │  SQLite      │
                                   └──────────────┘
```

## Quick Start

```bash
npm install
npm start
# Open http://localhost:3000
```

## Docker

```bash
docker compose up --build
```

## Tech Stack

- **Node.js** + **Express** — HTTP server and static files
- **ws** — WebSocket server
- **better-sqlite3** — Message persistence
- Vanilla JS frontend — no framework dependencies
