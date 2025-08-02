import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    lazyConnect: true
  }
});

client.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;
let connectionAttempted = false;

export async function getRedisClient() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      console.log('Connecting to Redis...');
      await client.connect();
      isConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.log('❌ Redis connection failed:', error.message);
      console.log('⚠️  App will run without Redis features');
      // Return a mock client that doesn't crash the app
      return createMockRedisClient();
    }
  }
  
  if (!isConnected) {
    return createMockRedisClient();
  }
  
  return client;
}

// Mock Redis client for when Redis is not available
function createMockRedisClient() {
  return {
    hSet: async () => 'OK',
    hGetAll: async () => ({}),
    sAdd: async () => 1,
    sMembers: async () => [],
    keys: async () => [],
    del: async () => 1,
    sRem: async () => 1,
    json: {
      set: async () => 'OK',
      get: async () => null
    },
    ft: {
      search: async () => ({ documents: [] }),
      create: async () => 'OK',
      info: async () => ({})
    },
    ts: {
      create: async () => 'OK',
      add: async () => 'OK',
      range: async () => []
    },
    xAdd: async () => '1-0',
    xRevRange: async () => []
  };
}