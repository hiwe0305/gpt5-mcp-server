# GPT-5 MCP Server

MCP (Model Context Protocol) server for AI-powered coding assistance with GPT-5.5.

---

## Features

| Tool | Description |
|------|-------------|
| `gpt5_code_complete` | Generate code from natural language prompts |
| `gpt5_code_review` | Review code for bugs, performance, security, style |
| `gpt5_refactor` | Refactor code with specific goals |
| `gpt5_explain_code` | Explain code in detail |
| `gpt5_debug` | Debug and find issues |

---

## Project Structure

```
gpt5-mcp-server/
├── src/
│   ├── index.ts           # Server entry point
│   ├── config/            # Environment configuration
│   ├── types/             # TypeScript types
│   ├── api/               # API client
│   ├── tools/             # Tool definitions & handlers
│   └── utils/             # Utilities
├── dist/                  # Compiled output
├── docs/                  # Documentation
├── enhancements/          # Optional features
├── Dockerfile
└── docker-compose.yml
```

---

## Quick Start

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your GPT5_API_KEY
```

### 3. Run

**Docker (recommended):**
```bash
docker-compose up -d
```

**Node.js:**
```bash
node dist/index.js
```

---

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GPT5_API_KEY` | Yes | - | API key for GPT-5.5 |
| `GPT5_API_URL` | No | `https://api.openai.com/v1` | API endpoint |
| `API_TIMEOUT` | No | `60000` | Request timeout (ms) |
| `MAX_TOKENS` | No | `4096` | Max tokens per response |

---

## Usage in Antigravity IDE

```
@gpt5_code_complete Write a hello world function in Python
@gpt5_code_review focus="security" language="javascript"
@gpt5_refactor goal="improve performance" language="python"
```

---

## Documentation

- [Quick Start](docs/QUICKSTART.md) - 5-minute setup guide
- [Deployment](docs/DEPLOYMENT.md) - Production deployment
- [Security](docs/SECURITY.md) - Security best practices

---

## License

MIT
