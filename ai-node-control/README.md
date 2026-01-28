# 🎛️ ACE - AI Command Environment

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sleek, modern dashboard for managing [Clawdbot](https://github.com/clawdbot/clawdbot) AI agents, sessions, nodes, and infrastructure. Monitor your AI systems in real-time with a beautiful dark-mode interface.

<!-- 
![ACE Dashboard](docs/screenshot.png)
-->

## ✨ Features

### 📊 Dashboard
- Real-time infrastructure overview
- GPU temperature & utilization monitoring
- Active sessions counter
- Node status at a glance

### 💬 Sessions
- Monitor active agent conversations
- View session history and context
- Track token usage and costs

### ⏰ Cron Jobs
- Schedule automated tasks
- Monitor job execution status
- View run history and logs

### 🖥️ Nodes
- Connected device management
- Platform detection (macOS, Windows, Linux)
- Tailscale network integration

### 📝 Activity Feed
- Live stream of agent actions
- Message, tool, and system events
- Filterable by type and channel

### 🧠 Memory Browser
- Browse agent memory files (MEMORY.md, SOUL.md, etc.)
- View and edit workspace context
- Daily memory file navigation

### 🔧 System Monitoring
- GPU stats and temperature
- Memory usage tracking
- Process monitoring

### 🔐 Security
- Token-based API authentication
- CORS protection with allowlists
- Security headers (X-Frame-Options, CSP)
- Tailscale IP allowlisting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- [Clawdbot](https://github.com/clawdbot/clawdbot) gateway running

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-node-control.git
cd ai-node-control

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Docker

```bash
docker build -t ace .
docker run -p 3001:3000 ace
```

## ⚙️ Configuration

Create a `.env.local` file in the project root:

```env
# Clawdbot Gateway Connection
AI_COMMAND_CENTER_TOKEN=your-secure-token-here

# Optional: Workspace path for memory browser
WORKSPACE=/path/to/your/workspace
```

### Security Configuration

The middleware (`src/middleware.ts`) controls access:

```typescript
// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "http://100.107.132.16:3001",  // Your Tailscale IPs
];

// API routes require x-api-key header
// GET /api/memory?token=xxx also supported
```

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── activity/          # Activity feed page
│   ├── api/               # API routes
│   │   ├── cron/          # Cron job management
│   │   ├── memory/        # Memory file access
│   │   ├── nodes/         # Node status
│   │   ├── sessions/      # Session management
│   │   └── system/        # System metrics
│   ├── cron/              # Cron UI page
│   ├── memory/            # Memory browser page
│   ├── nodes/             # Nodes page
│   ├── security/          # Security settings page
│   ├── sessions/          # Sessions page
│   ├── settings/          # App settings page
│   ├── system/            # System monitoring page
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Dashboard home
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── sidebar.tsx        # Navigation sidebar
│   └── ...
├── lib/
│   └── utils.ts           # Utility functions
└── middleware.ts          # Auth & security middleware
```

## 🔌 API Reference

All API routes require authentication via `x-api-key` header or `?token=` query param.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List active sessions |
| `/api/cron` | GET | List cron jobs |
| `/api/cron` | POST | Create cron job |
| `/api/cron/[id]` | DELETE | Remove cron job |
| `/api/nodes` | GET | List connected nodes |
| `/api/memory` | GET | List memory files |
| `/api/memory/file` | GET | Read memory file content |
| `/api/system/gpu` | GET | GPU stats |

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[Lucide Icons](https://lucide.dev/)** - Modern icon set
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[XYFlow](https://reactflow.dev/)** - Node graphs (future)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for the <a href="https://github.com/clawdbot/clawdbot">Clawdbot</a> ecosystem
</p>
