#!/bin/bash

echo "🧾 Starting ReceiptSense..."

# Check if Docker is available
if ! command -v docker >/dev/null 2>&1; then
    echo "⚠️  Docker not found. Starting without Redis Stack..."
    echo "📝 App will use fallback mode (OCR still works)"
else
    # Check if Redis container exists and is running
    if docker ps -q -f name=receipt-redis > /dev/null; then
        echo "✅ Redis Stack is already running"
    elif docker ps -aq -f name=receipt-redis > /dev/null; then
        echo "🔄 Starting existing Redis container..."
        docker start receipt-redis
        sleep 3
    else
        echo "🚀 Starting new Redis Stack container..."
        docker run -d --name receipt-redis -p 6379:6379 redis/redis-stack:latest
        sleep 5
    fi
fi

# Check Node version and switch if nvm is available
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js $NODE_VERSION detected. Node 20+ required."
    if command -v nvm >/dev/null 2>&1; then
        echo "🔄 Switching to Node 20 with nvm..."
        source ~/.nvm/nvm.sh && nvm use 20
    else
        echo "❌ nvm not found. Please install Node 20+ manually:"
        echo "   - Download from: https://nodejs.org/"
        echo "   - Or install nvm: https://github.com/nvm-sh/nvm"
        exit 1
    fi
else
    echo "✅ Node.js $(node --version) is compatible"
fi

# Clean and build Next.js app
echo "Building Next.js app..."
rm -rf .next
npm run build

# Start Next.js app
echo "Starting Next.js app..."
npm run dev

echo "✅ App started at http://localhost:3000"