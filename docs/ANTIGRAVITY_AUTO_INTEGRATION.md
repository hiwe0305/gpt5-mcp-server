# GPT-5 MCP Server - Antigravity IDE Auto Integration

## Overview

This document explains how to integrate GPT-5 MCP Server with Antigravity IDE via Model Context Protocol (MCP).

## Quick Integration

Run setup script:

```bash
./auto-setup.sh
```

After setup, restart Antigravity IDE so the MCP server config is loaded.

## Manual Configuration

MCP config file location:

`~/.config/antigravity/mcp.json`

### Docker Deployment (Option 1)

```json
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "gpt5-mcp-server",
        "node",
        "/app/dist/index.js"
      ]
    }
  }
}
```

### Systemd/PM2 Deployment (Options 2-3)

```json
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "node",
      "args": [
        "/path/to/gpt5-mcp-server/dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "your-api-key",
        "GPT5_API_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

## MCP Server Features

### Available Tools (Current)

1. **gpt5_code_complete** - Complete code from a prompt and optional context
2. **gpt5_code_review** - Review code for bugs, performance, security, style
3. **gpt5_refactor** - Refactor code with a specific goal
4. **gpt5_explain_code** - Explain code with selectable detail level
5. **gpt5_debug** - Debug code using error context

Note: Tool list is synced with `src/tools/definitions.ts`.

## Configuration Variables

| Variable | Description | Default |
|----------|-------------|---------|
| GPT5_API_KEY | API authentication key | Required |
| GPT5_API_URL | API endpoint URL | https://api.openai.com/v1 |

## Troubleshooting

### Server Not Starting

1. Check container status:

```bash
docker ps | grep gpt5-mcp-server
```

2. Check logs:

```bash
docker logs gpt5-mcp-server
```

3. Verify `.env` exists and credentials are valid.

### Docker Compose Error: `Not supported URL scheme http+docker`

Cause: legacy `docker-compose` (Python v1) is incompatible with newer Docker Engine.

Fix: use Compose v2 plugin via Docker CLI:

```bash
docker compose version
```

If command is available, use `docker compose ...` instead of `docker-compose ...`.

### Docker Build Error: `sh: tsc: not found`

Cause: TypeScript is in `devDependencies` but dependencies were installed as production-only.

Fix in Dockerfile:

```dockerfile
RUN npm ci
```

Do not use `npm ci --only=production` before `npm run build`.

### Compose Warning: `the attribute version is obsolete`

Compose v2 ignores top-level `version:` in `docker-compose.yml`. Remove it to avoid confusion.

## Security Notes

- Keep `.env` permission strict (`chmod 600 .env`)
- Never commit API keys into git
- For production, prefer secret management instead of plain env files
