#!/bin/bash

echo "🚀 Starting ReceiptSense on Replit..."

# Start Redis Stack in background
echo "📦 Starting Redis Stack..."
redis-server --daemonize yes --port 6379 --loadmodule /nix/store/*/lib/redisearch.so --loadmodule /nix/store/*/lib/redistimeseries.so --loadmodule /nix/store/*/lib/rejson.so

# Wait for Redis to start
sleep 3

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Next.js app
echo "🌟 Starting ReceiptSense..."
npm run dev