# 🚀 GPT-5 MCP Server for Antigravity IDE

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-05-15

MCP (Model Context Protocol) server that integrates GPT-5.5 API with Antigravity IDE for advanced AI-powered coding assistance.

---

## ✨ Features

### 10 AI Coding Tools

#### Base Tools (5)
1. **Code Completion** - Generate code from natural language
2. **Code Review** - Comprehensive analysis (bugs, performance, security, style)
3. **Refactoring** - Intelligent code refactoring
4. **Code Explanation** - Detailed code explanations
5. **Debugging** - Find and fix bugs with root cause analysis

#### Enhanced Tools (5)
6. **Generate Tests** - Auto-generate unit tests
7. **Optimize** - Performance optimization suggestions
8. **Generate Docs** - Auto-generate documentation
9. **Convert Code** - Convert between programming languages
10. **Security Audit** - Security vulnerability scanning

### Enhancements
- ✅ **Caching Layer** - Redis-compatible caching for faster responses
- ✅ **Monitoring & Analytics** - Track usage, performance, and costs
- ✅ **Error Tracking** - Comprehensive error logging
- ✅ **Rate Limiting** - Prevent API abuse

---

## 🚀 Quick Start (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
cd gpt5-mcp-server
./auto-setup.sh
```

Select option 1 (Docker Compose), enter your API key, done!

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Create .env file
cat > .env << 'ENVEOF'
GPT5_API_KEY=your-api-key-here
GPT5_API_URL=https://api.openai.com/v1
NODE_ENV=production
ENVEOF

# Start with Docker (recommended)
docker-compose up -d

# OR start with Node.js
node dist/index.js
```

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- GPT-5.5 API key
- Docker (recommended) or Systemd/PM2

---

## 🐳 Deployment Options

### 1. Docker Compose (Recommended) ⭐⭐⭐⭐⭐

**Best for**: Production, auto-start on boot

```bash
docker-compose up -d
```

**Features**:
- ✅ Auto-start on boot
- ✅ Auto-restart on crash
- ✅ Isolated environment
- ✅ Easy management

### 2. Systemd Service ⭐⭐⭐⭐

**Best for**: Linux servers, native integration

```bash
sudo cp gpt5-mcp-server.service /etc/systemd/system/gpt5-mcp-server@.service
sudo systemctl enable gpt5-mcp-server@$USER
sudo systemctl start gpt5-mcp-server@$USER
```

### 3. PM2 ⭐⭐⭐⭐

**Best for**: Development, Node.js native

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**All 3 options auto-start on boot!**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## ⚙️ Configuration

### Environment Variables

```bash
# Required
GPT5_API_KEY=your-api-key-here

# Optional
GPT5_API_URL=https://api.openai.com/v1  # Default OpenAI endpoint
NODE_ENV=production                      # production or development
```

### Antigravity IDE Configuration

Create or edit `~/.config/antigravity/mcp.json`:

#### For Docker:
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

#### For Systemd/PM2:
```json
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "node",
      "args": [
        "/home/hiwe/project/lob-brain-update/gpt5-mcp-server/dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "your-api-key-here",
        "GPT5_API_URL": "https://api.openai.com/v1"
      }
    }
  }
}
```

---

## 🎮 Usage in Antigravity IDE

### Code Completion
```
@gpt5_code_complete Write a function to calculate fibonacci numbers
```

### Code Review
```
@gpt5_code_review language="javascript"
function add(a, b) {
  return a + b;
}
```

### Refactoring
```
@gpt5_refactor goal="modernize to ES6+" language="javascript"
var myFunc = function(x) {
  return x * 2;
}
```

### Debugging
```
@gpt5_debug error_message="TypeError: Cannot read property 'length' of undefined"
function processArray(arr) {
  return arr.map(x => x * 2);
}
processArray();
```

### Generate Tests
```
@gpt5_generate_tests language="python"
def calculate_total(items):
    return sum(item['price'] for item in items)
```

### Security Audit
```
@gpt5_security_audit language="javascript"
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, result) => res.json(result));
});
```

---

## 🔐 Security

See [SECURITY.md](./SECURITY.md) for comprehensive security guide including:
- API Key Management
- Key Rotation Schedule
- Access Control
- Network Security
- Monitoring & Auditing
- Backup & Recovery
- Incident Response
- Compliance & Best Practices

---

## 📊 Monitoring

The server includes built-in monitoring:

```bash
# View metrics (if monitoring enabled)
curl http://localhost:3000/metrics

# View logs
docker-compose logs -f              # Docker
sudo journalctl -u gpt5-mcp-server  # Systemd
pm2 logs gpt5-mcp-server            # PM2
```

---

## 🛠️ Management

### Docker Compose
```bash
docker-compose ps        # Status
docker-compose logs -f   # Logs
docker-compose restart   # Restart
docker-compose stop      # Stop
docker-compose start     # Start
```

### Systemd
```bash
sudo systemctl status gpt5-mcp-server@$USER
sudo journalctl -u gpt5-mcp-server@$USER -f
sudo systemctl restart gpt5-mcp-server@$USER
```

### PM2
```bash
pm2 status               # Status
pm2 logs gpt5-mcp-server # Logs
pm2 restart gpt5-mcp-server
pm2 monit                # Monitor
```

---

## 🐛 Troubleshooting

### Server not starting?
```bash
# Check logs
docker-compose logs -f
# or
sudo journalctl -u gpt5-mcp-server@$USER -f
# or
pm2 logs gpt5-mcp-server
```

### Antigravity not seeing tools?
1. Check server is running: `docker-compose ps`
2. Verify config: `cat ~/.config/antigravity/mcp.json`
3. Restart Antigravity IDE
4. Check Antigravity logs

### API key issues?
```bash
# Test API key
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

See [ANTIGRAVITY_AUTO_INTEGRATION.md](./ANTIGRAVITY_AUTO_INTEGRATION.md) for detailed troubleshooting.

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **START_HERE_FIRST.md** | Quick entry point |
| **QUICKSTART.md** | 5-minute setup guide |
| **ANTIGRAVITY_AUTO_INTEGRATION.md** | Auto-integration guide (369 lines) |
| **SECURITY.md** | Security best practices (404 lines) |
| **DEPLOYMENT.md** | Deployment options guide |
| **enhancements/README.md** | Enhancements documentation |

---

## 🏗️ Project Structure

```
gpt5-mcp-server/
├── src/
│   └── index.ts                    # Main server (451 lines)
├── enhancements/
│   ├── cache.ts                    # Caching layer (133 lines)
│   ├── monitoring.ts               # Analytics (190 lines)
│   ├── additional-tools.ts         # 5 enhanced tools (382 lines)
│   └── README.md                   # Enhancement docs
├── Dockerfile                      # Docker image
├── docker-compose.yml              # Docker compose config
├── gpt5-mcp-server.service         # Systemd service
├── ecosystem.config.js             # PM2 config
├── auto-setup.sh                   # Automated setup script
├── setup.sh                        # Basic setup script
├── SECURITY.md                     # Security guide (404 lines)
├── ANTIGRAVITY_AUTO_INTEGRATION.md # Integration guide (369 lines)
├── DEPLOYMENT.md                   # Deployment guide
├── QUICKSTART.md                   # Quick start
└── README.md                       # This file
```

---

## 🔧 Development

### Build
```bash
npm run build
```

### Watch mode
```bash
npm run watch
```

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

---

## 📈 Statistics

- **Total Code**: ~1,400 lines
- **Total Documentation**: ~4,700 lines
- **Total Tools**: 10 AI coding tools
- **Deployment Options**: 3 (Docker, Systemd, PM2)
- **Security Sections**: 10 comprehensive sections

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Documentation**: See files in this directory
- **Issues**: Create an issue in the repository
- **Security**: See [SECURITY.md](./SECURITY.md)

---

## 🎉 Quick Links

- **Start Now**: Run `./auto-setup.sh`
- **Security Guide**: [SECURITY.md](./SECURITY.md)
- **Integration Guide**: [ANTIGRAVITY_AUTO_INTEGRATION.md](./ANTIGRAVITY_AUTO_INTEGRATION.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-05-15

🚀 **Happy Coding!**
