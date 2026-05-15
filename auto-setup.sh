#!/bin/bash

# Auto Setup Script for GPT-5 MCP Server
# Tự động cài đặt và tích hợp với Antigravity IDE

set -e

echo "🚀 GPT-5 MCP Server - Auto Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Vui lòng chạy script này trong thư mục gpt5-mcp-server"
    exit 1
fi

echo "Chọn phương án deployment:"
echo ""
echo "1) Docker Compose (Khuyến nghị - Production ready)"
echo "2) Systemd Service (Linux native)"
echo "3) PM2 (Development friendly)"
echo ""
read -p "Nhập lựa chọn (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Cài đặt với Docker Compose"
        echo "=============================="
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            print_warning "Docker chưa được cài đặt"
            read -p "Bạn có muốn cài Docker không? (y/n): " install_docker
            
            if [ "$install_docker" = "y" ]; then
                echo "Đang cài Docker..."
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                rm get-docker.sh
                print_success "Docker đã được cài đặt"
                print_warning "Vui lòng logout và login lại, sau đó chạy lại script này"
                exit 0
            else
                print_error "Không thể tiếp tục mà không có Docker"
                exit 1
            fi
        fi
        
        # Check if docker-compose is installed
        if ! command -v docker-compose &> /dev/null; then
            print_error "docker-compose chưa được cài đặt"
            echo "Cài đặt: sudo apt-get install docker-compose"
            exit 1
        fi
        
        # Setup .env file
        if [ ! -f ".env" ]; then
            echo ""
            print_info "Tạo file .env"
            read -p "Nhập GPT5_API_KEY: " api_key
            read -p "Nhập GPT5_API_URL (mặc định: https://api.openai.com/v1): " api_url
            api_url=${api_url:-https://api.openai.com/v1}
            
            cat > .env << ENVEOF
GPT5_API_KEY=$api_key
GPT5_API_URL=$api_url
NODE_ENV=production
ENVEOF
            
            chmod 600 .env
            print_success "File .env đã được tạo"
        else
            print_info "File .env đã tồn tại, bỏ qua"
        fi
        
        # Build and start
        echo ""
        print_info "Building Docker image..."
        docker-compose build
        
        print_info "Starting server..."
        docker-compose up -d
        
        sleep 3
        
        # Check status
        if docker-compose ps | grep -q "Up"; then
            print_success "Server đã chạy thành công!"
            echo ""
            echo "Kiểm tra logs:"
            echo "  docker-compose logs -f"
            echo ""
            echo "Quản lý server:"
            echo "  docker-compose ps       # Xem status"
            echo "  docker-compose restart  # Restart"
            echo "  docker-compose stop     # Stop"
            echo "  docker-compose start    # Start"
        else
            print_error "Server không khởi động được"
            echo "Xem logs: docker-compose logs"
            exit 1
        fi
        
        # Configure Antigravity
        echo ""
        print_info "Cấu hình Antigravity IDE"
        
        ANTIGRAVITY_CONFIG="$HOME/.config/antigravity/mcp.json"
        mkdir -p "$(dirname "$ANTIGRAVITY_CONFIG")"
        
        if [ ! -f "$ANTIGRAVITY_CONFIG" ]; then
            cat > "$ANTIGRAVITY_CONFIG" << 'JSONEOF'
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
            print_success "Đã tạo cấu hình Antigravity: $ANTIGRAVITY_CONFIG"
        else
            print_warning "File cấu hình đã tồn tại: $ANTIGRAVITY_CONFIG"
            print_info "Vui lòng thêm cấu hình thủ công (xem ANTIGRAVITY_AUTO_INTEGRATION.md)"
        fi
        
        echo ""
        print_success "✅ Hoàn thành! Server sẽ tự động chạy khi boot máy."
        print_info "Restart Antigravity IDE để áp dụng cấu hình mới"
        ;;
        
    2)
        echo ""
        echo "🐧 Cài đặt với Systemd"
        echo "======================"
        
        # Build
        print_info "Building server..."
        npm install
        npm run build
        
        # Setup .env
        if [ ! -f ".env" ]; then
            echo ""
            print_info "Tạo file .env"
            read -p "Nhập GPT5_API_KEY: " api_key
            read -p "Nhập GPT5_API_URL (mặc định: https://api.openai.com/v1): " api_url
            api_url=${api_url:-https://api.openai.com/v1}
            
            cat > .env << ENVEOF
GPT5_API_KEY=$api_key
GPT5_API_URL=$api_url
NODE_ENV=production
ENVEOF
            
            chmod 600 .env
            print_success "File .env đã được tạo"
        fi
        
        # Install systemd service
        print_info "Cài đặt systemd service..."
        sudo cp gpt5-mcp-server.service /etc/systemd/system/gpt5-mcp-server@.service
        sudo systemctl daemon-reload
        sudo systemctl enable gpt5-mcp-server@$USER
        sudo systemctl start gpt5-mcp-server@$USER
        
        sleep 2
        
        # Check status
        if sudo systemctl is-active --quiet gpt5-mcp-server@$USER; then
            print_success "Server đã chạy thành công!"
            echo ""
            echo "Kiểm tra logs:"
            echo "  sudo journalctl -u gpt5-mcp-server@$USER -f"
            echo ""
            echo "Quản lý server:"
            echo "  sudo systemctl status gpt5-mcp-server@$USER"
            echo "  sudo systemctl restart gpt5-mcp-server@$USER"
            echo "  sudo systemctl stop gpt5-mcp-server@$USER"
        else
            print_error "Server không khởi động được"
            echo "Xem logs: sudo journalctl -u gpt5-mcp-server@$USER -n 50"
            exit 1
        fi
        
        # Configure Antigravity
        echo ""
        print_info "Cấu hình Antigravity IDE"
        
        ANTIGRAVITY_CONFIG="$HOME/.config/antigravity/mcp.json"
        mkdir -p "$(dirname "$ANTIGRAVITY_CONFIG")"
        
        CURRENT_DIR=$(pwd)
        
        if [ ! -f "$ANTIGRAVITY_CONFIG" ]; then
            cat > "$ANTIGRAVITY_CONFIG" << JSONEOF
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "node",
      "args": [
        "$CURRENT_DIR/dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "$(grep GPT5_API_KEY .env | cut -d '=' -f2)",
        "GPT5_API_URL": "$(grep GPT5_API_URL .env | cut -d '=' -f2)"
      }
    }
  }
}
JSONEOF
            print_success "Đã tạo cấu hình Antigravity: $ANTIGRAVITY_CONFIG"
        else
            print_warning "File cấu hình đã tồn tại: $ANTIGRAVITY_CONFIG"
            print_info "Vui lòng thêm cấu hình thủ công (xem ANTIGRAVITY_AUTO_INTEGRATION.md)"
        fi
        
        echo ""
        print_success "✅ Hoàn thành! Server sẽ tự động chạy khi boot máy."
        print_info "Restart Antigravity IDE để áp dụng cấu hình mới"
        ;;
        
    3)
        echo ""
        echo "📦 Cài đặt với PM2"
        echo "=================="
        
        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            print_warning "PM2 chưa được cài đặt"
            read -p "Bạn có muốn cài PM2 không? (y/n): " install_pm2
            
            if [ "$install_pm2" = "y" ]; then
                echo "Đang cài PM2..."
                npm install -g pm2
                print_success "PM2 đã được cài đặt"
            else
                print_error "Không thể tiếp tục mà không có PM2"
                exit 1
            fi
        fi
        
        # Build
        print_info "Building server..."
        npm install
        npm run build
        
        # Setup .env
        if [ ! -f ".env" ]; then
            echo ""
            print_info "Tạo file .env"
            read -p "Nhập GPT5_API_KEY: " api_key
            read -p "Nhập GPT5_API_URL (mặc định: https://api.openai.com/v1): " api_url
            api_url=${api_url:-https://api.openai.com/v1}
            
            cat > .env << ENVEOF
GPT5_API_KEY=$api_key
GPT5_API_URL=$api_url
NODE_ENV=production
ENVEOF
            
            chmod 600 .env
            print_success "File .env đã được tạo"
        fi
        
        # Start with PM2
        print_info "Starting server với PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        
        # Setup startup
        print_info "Cấu hình auto-start..."
        pm2 startup | grep "sudo" | bash
        
        sleep 2
        
        # Check status
        if pm2 list | grep -q "gpt5-mcp-server.*online"; then
            print_success "Server đã chạy thành công!"
            echo ""
            echo "Kiểm tra logs:"
            echo "  pm2 logs gpt5-mcp-server"
            echo ""
            echo "Quản lý server:"
            echo "  pm2 status"
            echo "  pm2 restart gpt5-mcp-server"
            echo "  pm2 stop gpt5-mcp-server"
            echo "  pm2 monit"
        else
            print_error "Server không khởi động được"
            echo "Xem logs: pm2 logs gpt5-mcp-server"
            exit 1
        fi
        
        # Configure Antigravity
        echo ""
        print_info "Cấu hình Antigravity IDE"
        
        ANTIGRAVITY_CONFIG="$HOME/.config/antigravity/mcp.json"
        mkdir -p "$(dirname "$ANTIGRAVITY_CONFIG")"
        
        CURRENT_DIR=$(pwd)
        
        if [ ! -f "$ANTIGRAVITY_CONFIG" ]; then
            cat > "$ANTIGRAVITY_CONFIG" << JSONEOF
{
  "mcpServers": {
    "gpt5-coding": {
      "command": "node",
      "args": [
        "$CURRENT_DIR/dist/index.js"
      ],
      "env": {
        "GPT5_API_KEY": "$(grep GPT5_API_KEY .env | cut -d '=' -f2)",
        "GPT5_API_URL": "$(grep GPT5_API_URL .env | cut -d '=' -f2)"
      }
    }
  }
}
JSONEOF
            print_success "Đã tạo cấu hình Antigravity: $ANTIGRAVITY_CONFIG"
        else
            print_warning "File cấu hình đã tồn tại: $ANTIGRAVITY_CONFIG"
            print_info "Vui lòng thêm cấu hình thủ công (xem ANTIGRAVITY_AUTO_INTEGRATION.md)"
        fi
        
        echo ""
        print_success "✅ Hoàn thành! Server sẽ tự động chạy khi boot máy."
        print_info "Restart Antigravity IDE để áp dụng cấu hình mới"
        ;;
        
    *)
        print_error "Lựa chọn không hợp lệ"
        exit 1
        ;;
esac

echo ""
echo "📚 Tài liệu:"
echo "  - ANTIGRAVITY_AUTO_INTEGRATION.md - Hướng dẫn chi tiết"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - SECURITY.md - Security best practices"
echo ""
print_success "🎉 Setup hoàn tất! Chúc bạn code vui vẻ!"
