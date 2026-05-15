# 🔗 Tích hợp tự động GPT-5 MCP Server vào Antigravity IDE

**Mục tiêu**: Server tự động chạy khi khởi động máy, không cần chạy thủ công mỗi lần mở Antigravity.

---

## 🎯 Giải pháp khuyến nghị

Có 3 cách để server tự động chạy. Tôi khuyến nghị theo thứ tự:

1. **Docker Compose** (Tốt nhất cho production)
2. **Systemd** (Tốt cho Linux native)
3. **PM2** (Tốt cho development)

---

## 🐳 Phương án 1: Docker Compose (KHUYẾN NGHỊ)

### Tại sao nên dùng Docker?
- ✅ Server chạy độc lập, không ảnh hưởng hệ thống
- ✅ Tự động restart khi crash
- ✅ Tự động start khi boot máy
- ✅ Dễ update và rollback
- ✅ Logs được quản lý tốt

### Bước 1: Cài Docker (nếu chưa có)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Logout và login lại
```

### Bước 2: Setup server

```bash
cd /home/hiwe/project/lob-brain-update/gpt5-mcp-server

# Tạo .env file
cat > .env << 'ENVEOF'
GPT5_API_KEY=your-actual-api-key-here
GPT5_API_URL=https://api.openai.com/v1
NODE_ENV=production
ENVEOF

# Build và start
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
```

### Bước 3: Cấu hình Antigravity để kết nối với Docker

Tạo hoặc chỉnh sửa file cấu hình Antigravity:

```bash
# Tìm file config của Antigravity
mkdir -p ~/.config/antigravity
nano ~/.config/antigravity/mcp.json
```

Thêm cấu hình sau:

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

### Bước 4: Enable auto-start khi boot

Docker Compose với `restart: unless-stopped` đã tự động start khi boot. Không cần làm gì thêm!

### Bước 5: Restart Antigravity IDE

Khởi động lại Antigravity để load cấu hình mới.

### Quản lý Docker server

```bash
# Xem status
docker-compose ps

# Xem logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose stop

# Start lại
docker-compose start

# Update code
git pull
docker-compose build
docker-compose up -d
```

---

## 🐧 Phương án 2: Systemd Service (Linux Native)

### Tại sao dùng Systemd?
- ✅ Native Linux integration
- ✅ Tự động start khi boot
- ✅ Quản lý bằng systemctl
- ✅ Logs vào journalctl

### Bước 1: Build server

```bash
cd /home/hiwe/project/lob-brain-update/gpt5-mcp-server
npm install
npm run build
```

### Bước 2: Tạo .env file

```bash
cat > .env << 'ENVEOF'
GPT5_API_KEY=your-actual-api-key-here
GPT5_API_URL=https://api.openai.com/v1
NODE_ENV=production
ENVEOF

chmod 600 .env
```

### Bước 3: Install systemd service

```bash
# Copy service file
sudo cp gpt5-mcp-server.service /etc/systemd/system/gpt5-mcp-server@.service

# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable gpt5-mcp-server@$USER

# Start service
sudo systemctl start gpt5-mcp-server@$USER

# Check status
sudo systemctl status gpt5-mcp-server@$USER
```

### Bước 4: Cấu hình Antigravity

```bash
mkdir -p ~/.config/antigravity
nano ~/.config/antigravity/mcp.json
```

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

### Quản lý Systemd service

```bash
# Xem status
sudo systemctl status gpt5-mcp-server@$USER

# Xem logs
sudo journalctl -u gpt5-mcp-server@$USER -f

# Restart
sudo systemctl restart gpt5-mcp-server@$USER

# Stop
sudo systemctl stop gpt5-mcp-server@$USER

# Disable auto-start
sudo systemctl disable gpt5-mcp-server@$USER
```

---

## 📦 Phương án 3: PM2 (Node.js Process Manager)

### Tại sao dùng PM2?
- ✅ Dễ setup cho Node.js
- ✅ Built-in monitoring
- ✅ Auto-restart
- ✅ Logs dễ xem

### Bước 1: Cài PM2

```bash
npm install -g pm2
```

### Bước 2: Start server với PM2

```bash
cd /home/hiwe/project/lob-brain-update/gpt5-mcp-server

# Build
npm run build

# Start với PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Enable auto-start on boot
pm2 startup
# Copy và chạy command mà PM2 output
```

### Bước 3: Cấu hình Antigravity

Giống như Systemd, dùng cấu hình trực tiếp:

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

### Quản lý PM2

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs gpt5-mcp-server

# Restart
pm2 restart gpt5-mcp-server

# Stop
pm2 stop gpt5-mcp-server

# Delete
pm2 delete gpt5-mcp-server

# Monitor
pm2 monit
```

---

## 🔍 So sánh 3 phương án

| Tiêu chí | Docker | Systemd | PM2 |
|----------|--------|---------|-----|
| **Dễ setup** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Isolation** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Auto-start** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Logs** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Monitoring** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Update** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Portable** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Khuyến nghị**:
- **Production**: Docker Compose
- **Linux Server**: Systemd
- **Development**: PM2

---

## ✅ Checklist sau khi setup

```
[ ] Server đã chạy (check bằng docker ps / systemctl status / pm2 status)
[ ] Logs không có lỗi
[ ] Antigravity config đã đúng
[ ] Restart Antigravity IDE
[ ] Test tools trong Antigravity (@gpt5_code_complete test)
[ ] Restart máy và verify server tự động start
```

---

## 🐛 Troubleshooting

### Server không start

```bash
# Docker
docker-compose logs -f

# Systemd
sudo journalctl -u gpt5-mcp-server@$USER -f

# PM2
pm2 logs gpt5-mcp-server
```

### Antigravity không thấy tools

1. Check server đang chạy
2. Verify config path đúng
3. Restart Antigravity
4. Check Antigravity logs

### API key không hoạt động

```bash
# Test API key
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

---

## 📝 Kết luận

Sau khi setup xong một trong 3 phương án trên:

✅ Server sẽ **tự động chạy** khi khởi động máy
✅ **Không cần chạy thủ công** mỗi lần mở Antigravity
✅ Server **tự động restart** khi crash
✅ Logs được **quản lý tự động**

**Bạn chỉ cần mở Antigravity và dùng thôi!**

---

**Khuyến nghị cuối cùng**: Dùng **Docker Compose** cho production, đơn giản và mạnh mẽ nhất.
