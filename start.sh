#!/bin/bash

echo "🧾 Starting Receipt-to-Insights App..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Starting Redis Stack with Docker..."
    docker run -d --name receipt-redis -p 6379:6379 redis/redis-stack:latest
    sleep 5
fi

# Clean and build Next.js app
echo "Building Next.js app..."
rm -rf .next
npm run build

# Start Next.js app
echo "Starting Next.js app..."
npm run dev

echo "✅ App started at http://localhost:3000"