#!/bin/bash

echo "🧾 Starting Receipt-to-Insights App..."

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

# Clean and build Next.js app
echo "Building Next.js app..."
rm -rf .next
npm run build

# Start Next.js app
echo "Starting Next.js app..."
npm run dev

echo "✅ App started at http://localhost:3000"