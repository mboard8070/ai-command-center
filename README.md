# MAUDE Command Center

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

Web dashboard for **MAUDE** (Multi-Agent Unified Dispatch Engine) - monitor conversations, memory, system resources, and connected channels in real-time.

## Features

### Dashboard
- Real-time infrastructure overview
- GPU temperature & utilization monitoring (nvidia-smi)
- Active sessions and channel status

### Sessions
- View conversation history across all channels
- Track messages from TUI and Telegram
- Monitor message counts and timestamps

### Activity Feed
- Live stream of MAUDE interactions
- Messages from CLI and Telegram channels
- Real-time sync display

### Memory Browser
- Browse MAUDE's semantic memory database
- View stored facts, preferences, and context
- Search across memory categories

### Nodes
- Channel status (TUI, Telegram)
- DGX Spark hub monitoring
- Connection state tracking

### System Monitoring
- GPU stats and temperature
- Memory usage tracking
- CPU utilization

## Quick Start

### Prerequisites

- Node.js 18+
- MAUDE running (`python3 chat_local.py`)
- MAUDE data directory (`~/.config/maude/`)

### Installation

```bash
cd ai-command-center

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build

```bash
npm run build
npm start
```

## Configuration

Create a `.env.local` file:

```env
# API authentication token
AI_COMMAND_CENTER_TOKEN=your-secure-token-here

# MAUDE data path (default: ~/.config/maude)
MAUDE_DATA_PATH=/home/username/.config/maude
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── activity/      # Chat sync log reader
│   │   ├── memory/        # SQLite memory database
│   │   ├── nodes/         # Channel status
│   │   ├── sessions/      # Conversation history
│   │   └── system/        # GPU/CPU metrics
│   ├── activity/          # Activity feed page
│   ├── memory/            # Memory browser page
│   ├── nodes/             # Nodes page
│   ├── sessions/          # Sessions page
│   ├── settings/          # Settings page
│   ├── system/            # System monitoring page
│   └── page.tsx           # Dashboard home
├── components/
│   ├── ui/                # shadcn/ui components
│   └── top-nav.tsx        # Navigation header
└── lib/
    ├── api.ts             # API client
    └── utils.ts           # Utilities
```

## Data Sources

The dashboard reads from MAUDE's local data:

| Data | Source |
|------|--------|
| Activity | `~/.config/maude/chat_sync.jsonl` |
| Memory | `~/.config/maude/memory.db` (SQLite) |
| Sessions | `~/.config/maude/memory.db` conversations table |
| System | `nvidia-smi` and system commands |

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - UI components
- **better-sqlite3** - SQLite database access
- **Lucide Icons** - Icon set

## Related

- [MAUDE (terminal-llm)](https://github.com/mboard8070/terminal-llm) - The MAUDE AI assistant

---

Built for the MAUDE ecosystem
