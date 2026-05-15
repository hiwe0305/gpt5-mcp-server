# 🚀 Deployment Guide - GPT-5 MCP Server

**Version**: 1.0.0
**Last Updated**: 2026-05-15

---

## 📋 Deployment Options

Có 3 cách để deploy server tự động chạy:

1. **Docker Compose** (Khuyến nghị) - Dễ quản lý, portable
2. **Systemd Service** - Native Linux, tự động khởi động
3. **PM2** - Node.js process manager

---

## 🐳 Option 1: Docker Compose (Khuyến nghị)

### Ưu điểm:
- ✅ Isolated environment
- ✅ Easy to update
- ✅ Portable across systems
- ✅ Auto-restart on failure
- ✅ Log management built-in

### Setup:

#### Bước 1: Cài đặt Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Logout và login lại để apply group changes
```

#### Bước 2: Build và chạy
```bash
cd gpt5-mcp-server

# Build image
docker-compose build

# Start server (chạy background)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop server
docker-compose down

# Restart server
docker-compose restart
```

#### Bước 3: Cấu hình Antigravity
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
        "dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "your-key",
        "GPT5_API_URL": "https://your-endpoint.com/v1"
      }
    }
  }
}
```

### Quản lý:
```bash
# Xem status
docker-compose ps

# Xem logs
docker-compose logs -f gpt5-mcp-server

# Restart
docker-compose restart

# Update code
git pull
docker-compose build
docker-compose up -d

# Stop
docker-compose down
```

---

## 🔧 Option 2: Systemd Service

### Ưu điểm:
- ✅ Native Linux integration
- ✅ Auto-start on boot
- ✅ System-level management
- ✅ Journal logging

### Setup:

#### Bước 1: Build project
```bash
cd gpt5-mcp-server
npm install
npm run build
```

#### Bước 2: Install systemd service
```bash
# Copy service file
sudo cp gpt5-mcp-server.service /etc/systemd/system/gpt5-mcp-server@.service

# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable gpt5-mcp-server@$USER

# Start service
sudo systemctl start gpt5-mcp-server@$USER

# Check status
sudo systemctl status gpt5-mcp-server@$USER
```

#### Bước 3: Cấu hình Antigravity
```json
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "systemd-run",
      "args": [
        "--user",
        "--pipe",
        "node",
        "/home/hiwe/project/lob-brain-update/gpt5-mcp-server/dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "your-key",
        "GPT5_API_URL": "https://your-endpoint.com/v1"
      }
    }
  }
}
```

### Quản lý:
```bash
# Start
sudo systemctl start gpt5-mcp-server@$USER

# Stop
sudo systemctl stop gpt5-mcp-server@$USER

# Restart
sudo systemctl restart gpt5-mcp-server@$USER

# Status
sudo systemctl status gpt5-mcp-server@$USER

# Logs
sudo journalctl -u gpt5-mcp-server@$USER -f

# Disable auto-start
sudo systemctl disable gpt5-mcp-server@$USER
```

---

## 📦 Option 3: PM2 Process Manager

### Ưu điểm:
- ✅ Node.js native
- ✅ Easy to use
- ✅ Built-in monitoring
- ✅ Log management

### Setup:

#### Bước 1: Install PM2
```bash
npm install -g pm2
```

#### Bước 2: Create PM2 config
```bash
cat > ecosystem.config.js << 'EOPM2'
module.exports = {
  apps: [{
    name: 'gpt5-mcp-server',
    script: './dist/index.js',
    cwd: '/home/hiwe/project/lob-brain-update/gpt5-mcp-server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
EOPM2
```

#### Bước 3: Start with PM2
```bash
cd gpt5-mcp-server

# Start
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the command it gives you

# Status
pm2 status

# Logs
pm2 logs gpt5-mcp-server
```

#### Bước 4: Cấu hình Antigravity
```json
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "pm2",
      "args": [
        "exec",
        "gpt5-mcp-server",
        "--",
        "node",
        "dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "your-key",
        "GPT5_API_URL": "https://your-endpoint.com/v1"
      }
    }
  }
}
```

### Quản lý:
```bash
# Start
pm2 start gpt5-mcp-server

# Stop
pm2 stop gpt5-mcp-server

# Restart
pm2 restart gpt5-mcp-server

# Delete
pm2 delete gpt5-mcp-server

# Logs
pm2 logs gpt5-mcp-server

# Monitor
pm2 monit

# Status
pm2 status
```

---

## 🔄 Auto-Start Configuration

### Docker Compose
```bash
# Already configured with restart: unless-stopped
# Server will auto-start on system boot if Docker is enabled

# Enable Docker on boot
sudo systemctl enable docker
```

### Systemd
```bash
# Enable auto-start
sudo systemctl enable gpt5-mcp-server@$USER

# Disable auto-start
sudo systemctl disable gpt5-mcp-server@$USER
```

### PM2
```bash
# Setup startup script
pm2 startup

# Save current process list
pm2 save

# Remove startup script
pm2 unstartup
```

---

## 📊 Monitoring & Logs

### Docker
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs for specific time
docker-compose logs --since 1h

# Container stats
docker stats gpt5-mcp-server
```

### Systemd
```bash
# Real-time logs
sudo journalctl -u gpt5-mcp-server@$USER -f

# Last 100 lines
sudo journalctl -u gpt5-mcp-server@$USER -n 100

# Logs since boot
sudo journalctl -u gpt5-mcp-server@$USER -b

# Logs for specific time
sudo journalctl -u gpt5-mcp-server@$USER --since "1 hour ago"
```

### PM2
```bash
# Real-time logs
pm2 logs gpt5-mcp-server

# Monitor dashboard
pm2 monit

# Web dashboard
pm2 web
```

---

## 🔧 Troubleshooting

### Server không start

**Docker:**
```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

**Systemd:**
```bash
# Check status
sudo systemctl status gpt5-mcp-server@$USER

# Check logs
sudo journalctl -u gpt5-mcp-server@$USER -n 50

# Verify .env file
cat .env

# Test manually
node dist/index.js
```

**PM2:**
```bash
# Check status
pm2 status

# Check logs
pm2 logs gpt5-mcp-server --lines 50

# Restart
pm2 restart gpt5-mcp-server
```

### Antigravity không kết nối được

1. **Verify server đang chạy:**
```bash
# Docker
docker-compose ps

# Systemd
sudo systemctl status gpt5-mcp-server@$USER

# PM2
pm2 status
```

2. **Check logs:**
```bash
# Xem logs để tìm errors
```

3. **Test server manually:**
```bash
# Stop auto service
# Run manually to see errors
cd gpt5-mcp-server
export GPT5_API_KEY="your-key"
export GPT5_API_URL="https://your-endpoint.com/v1"
node dist/index.js
```

4. **Verify Antigravity config:**
```bash
cat ~/.antigravity/mcp.json
# Check paths are correct
```

---

## 🎯 Khuyến nghị

### Cho Development:
- **PM2** - Dễ debug, restart nhanh

### Cho Production:
- **Docker Compose** - Isolated, portable, dễ scale

### Cho Server Linux:
- **Systemd** - Native, reliable, system-level

---

## 📝 Deployment Checklist

```
Pre-deployment:
  [ ] Build project (npm run build)
  [ ] Configure .env file
  [ ] Test manually
  [ ] Review security settings

Deployment:
  [ ] Choose deployment method
  [ ] Install dependencies
  [ ] Configure auto-start
  [ ] Start service
  [ ] Verify service is running

Post-deployment:
  [ ] Configure Antigravity
  [ ] Test connection
  [ ] Monitor logs
  [ ] Setup monitoring alerts
  [ ] Document deployment
```

---

## 🔐 Security Notes

- ✅ Always use `.env` file for secrets
- ✅ Set proper file permissions (600 for .env)
- ✅ Run as non-root user
- ✅ Enable firewall rules
- ✅ Monitor logs regularly
- ✅ Keep dependencies updated

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs của deployment method bạn chọn
2. Verify .env configuration
3. Test server manually
4. Review SECURITY.md
5. Check Antigravity logs

---

**Document Version**: 1.0.0
**Last Updated**: 2026-05-15
