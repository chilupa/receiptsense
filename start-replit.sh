#!/bin/bash

echo "🚀 Starting ReceiptSense on Replit..."

# Kill any existing Redis processes
pkill redis-server 2>/dev/null || true

# Start Redis server
echo "📦 Starting Redis server..."
redis-server --port 6379 --bind 127.0.0.1 --daemonize yes --save "" --appendonly no

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to start..."
for i in {1..10}; do
    if redis-cli ping >/dev/null 2>&1; then
        echo "✅ Redis is ready!"
        break
    fi
    echo "Waiting... ($i/10)"
    sleep 1
done

# Check if Redis is actually running
if ! redis-cli ping >/dev/null 2>&1; then
    echo "❌ Redis failed to start. App will run without Redis features."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Next.js app
echo "🌟 Starting ReceiptSense..."
npm run dev