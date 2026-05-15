# 🚀 Quick Start Guide - GPT-5 MCP Server

**Thời gian setup**: 5 phút  
**Trạng thái**: ✅ Production Ready

---

## 🎯 Mục tiêu

Setup GPT-5 MCP Server tích hợp với Antigravity IDE, tự động chạy khi boot máy.

---

## ⚡ Cách 1: Setup tự động (KHUYẾN NGHỊ)

### Bước 1: Chạy script

```bash
cd gpt5-mcp-server
./auto-setup.sh
```

### Bước 2: Chọn deployment option

```
1) Docker Compose (Khuyến nghị - Production ready)
2) Systemd Service (Linux native)
3) PM2 (Development friendly)
```

**Chọn option 1** (Docker Compose)

### Bước 3: Nhập API key

Script sẽ hỏi:
- `GPT5_API_KEY`: Nhập API key của bạn
- `GPT5_API_URL`: Enter để dùng mặc định (https://api.openai.com/v1)

### Bước 4: Đợi script hoàn thành

Script sẽ tự động:
- Cài Docker (nếu chưa có)
- Build image
- Start server
- Cấu hình Antigravity

### Bước 5: Restart Antigravity IDE

Đóng và mở lại Antigravity IDE.

### Bước 6: Test

Trong Antigravity, thử:
```
@gpt5_code_complete Write a hello world function in Python
```

**XONG!** 🎉

---

## 🔧 Cách 2: Setup thủ công

### Bước 1: Cài đặt dependencies

```bash
cd gpt5-mcp-server
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

### Bước 3: Chọn deployment method

#### Option A: Docker Compose (Khuyến nghị)

```bash
# Start server
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f
```

#### Option B: Systemd Service

```bash
# Install service
sudo cp gpt5-mcp-server.service /etc/systemd/system/gpt5-mcp-server@.service
sudo systemctl daemon-reload
sudo systemctl enable gpt5-mcp-server@$USER
sudo systemctl start gpt5-mcp-server@$USER

# Verify
sudo systemctl status gpt5-mcp-server@$USER
```

#### Option C: PM2

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verify
pm2 status
```

### Bước 4: Cấu hình Antigravity

Tạo file `~/.config/antigravity/mcp.json`:

#### Cho Docker:
```bash
mkdir -p ~/.config/antigravity
cat > ~/.config/antigravity/mcp.json << 'JSONEOF'
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
JSONEOF
```

#### Cho Systemd/PM2:
```bash
mkdir -p ~/.config/antigravity
cat > ~/.config/antigravity/mcp.json << 'JSONEOF'
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
JSONEOF
```

### Bước 5: Restart Antigravity IDE

Khởi động lại Antigravity để load cấu hình mới.

### Bước 6: Test

```
@gpt5_code_complete Write a function to calculate fibonacci
```

---

## 🎮 Sử dụng

### 1. Code Completion
```
@gpt5_code_complete model="gpt-5.5" temperature=0.7
Write a React component for a todo list with add, delete, and mark as complete
```

### 2. Code Review
```
@gpt5_code_review focus="all" language="python"
def calculate_total(items):
    total = 0
    for item in items:
        total += item['price']
    return total
```

### 3. Refactoring
```
@gpt5_refactor goal="modernize to ES6+" language="javascript"
var myFunc = function(x) {
  return x * 2;
}
```

### 4. Debugging
```
@gpt5_debug error_message="TypeError: Cannot read property 'length' of undefined"
function processArray(arr) {
  return arr.map(x => x * 2).filter(x => x > 10);
}
processArray();
```

### 5. Generate Tests
```
@gpt5_generate_tests language="python" framework="pytest"
def calculate_total(items):
    return sum(item['price'] for item in items)
```

### 6. Security Audit
```
@gpt5_security_audit language="javascript"
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, result) => res.json(result));
});
```

---

## 🛠️ Quản lý server

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

### Server không start?

```bash
# Docker
docker-compose logs -f

# Systemd
sudo journalctl -u gpt5-mcp-server@$USER -f

# PM2
pm2 logs gpt5-mcp-server
```

**Kiểm tra**:
- API key đúng chưa?
- Docker/Node.js đã cài chưa?
- Port có bị chiếm không?

### Antigravity không thấy tools?

1. Check server đang chạy
2. Verify config path: `cat ~/.config/antigravity/mcp.json`
3. Restart Antigravity IDE
4. Check Antigravity logs

### API key không hoạt động?

```bash
# Test API key
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

---

## 📚 Tài liệu đầy đủ

- **ANTIGRAVITY_AUTO_INTEGRATION.md** - Tích hợp tự động chi tiết
- **SECURITY.md** - Security best practices
- **DEPLOYMENT.md** - Deployment options
- **README.md** - Tài liệu chính

---

## ✅ Checklist

```
[ ] Server đã chạy
[ ] Logs không có lỗi
[ ] Antigravity config đã đúng
[ ] Restart Antigravity IDE
[ ] Test tools hoạt động
[ ] Server tự động start khi boot
```

---

## 🎉 Kết quả

Sau khi setup xong:
- ✅ Server chạy 24/7
- ✅ Tự động start khi boot máy
- ✅ Tự động restart khi crash
- ✅ 10 AI coding tools sẵn sàng
- ✅ Không cần chạy thủ công nữa!

---

**Khuyến nghị**: Dùng Docker Compose cho production, đơn giản và mạnh mẽ nhất.

**Bắt đầu ngay**: `./auto-setup.sh` 🚀
