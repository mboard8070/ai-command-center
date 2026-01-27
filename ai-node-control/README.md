# ACE - AI Command Environment

A modern dashboard for managing Clawdbot AI agents, sessions, nodes, and infrastructure.

## Features

- **Dashboard** - Real-time overview of AI infrastructure status
- **Sessions** - Monitor and manage active agent sessions
- **Cron Jobs** - Schedule and monitor automated tasks
- **Nodes** - View connected devices and their status
- **Activity** - Live feed of agent actions and events
- **Memory** - Browse agent memory and context
- **System** - GPU monitoring, resource usage, and system health
- **Security** - API authentication, CORS, rate limiting, and access control
- **Settings** - Configure gateway connection and preferences

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Modern icon set

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Clawdbot gateway running

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Configuration

Set your gateway URL in the Settings tab, or create a `.env.local` file:

```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:18789
NEXT_PUBLIC_API_TOKEN=your-gateway-token
```

## Security

ACE includes built-in security features:

- **Token Authentication** - API token required for all requests
- **CORS Protection** - Cross-origin requests restricted to allowed domains
- **Rate Limiting** - Prevents API abuse (configurable)
- **Security Headers** - X-Frame-Options, CSP, and other protections

## Architecture

```
src/
├── app/              # Next.js App Router pages
│   ├── activity/     # Activity feed
│   ├── api/          # API routes (proxy to gateway)
│   ├── cron/         # Cron job management
│   ├── memory/       # Memory browser
│   ├── nodes/        # Node management
│   ├── security/     # Security settings
│   ├── sessions/     # Session management
│   ├── settings/     # App settings
│   └── system/       # System monitoring
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   └── ...           # App components
└── lib/              # Utilities and helpers
```

## License

MIT
