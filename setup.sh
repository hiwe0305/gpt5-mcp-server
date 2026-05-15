#!/bin/bash

# GPT-5 MCP Server Setup Script
# This script automates the setup process for users

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        GPT-5 MCP Server Setup for Antigravity IDE            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
echo "✅ Project built successfully"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your API credentials."
    echo ""
    echo "📝 Edit .env file:"
    echo "   GPT5_API_KEY=your-api-key-here"
    echo "   GPT5_API_URL=https://your-api-endpoint.com/v1"
    echo ""
else
    echo "✅ .env file exists"
fi

# Test if build was successful
if [ -f dist/index.js ]; then
    echo "✅ Build verification passed"
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete! ✅                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your API credentials"
    echo "2. Test the server: npm start"
    echo "3. Configure Antigravity IDE (see QUICKSTART.md)"
    echo "4. Start using tools!"
    echo ""
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
