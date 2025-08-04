import { createClient } from 'redis';

// Railway-specific Redis URL handling
const redisUrl = process.env.REDIS_URL || 
                process.env.REDIS_PRIVATE_URL || 
                process.env.REDIS_PUBLIC_URL || 
                'redis://localhost:6379';

console.log('Using Redis URL:', redisUrl.replace(/\/\/.*@/, '//***@')); // Hide credentials

const client = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    ...(redisUrl.includes('upstash.io') && { tls: true })
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
      
      // Check if Redis Stack modules are available
      const hasRedisStack = await checkRedisStackCapabilities(client);
      if (!hasRedisStack) {
        console.log('⚠️  Redis Stack modules not available, using fallback mode');
        return createEnhancedRedisClient(client);
      }
      
      console.log('✅ Redis Stack modules available');
      
    } catch (error) {
      console.error('❌ Redis connection failed:', (error as Error).message);
      console.error('Environment:', process.env.NODE_ENV);
      console.error('Redis URL:', process.env.REDIS_URL);
      console.log('⚠️  App will run without Redis features');
      return createMockRedisClient();
    }
  }
  
  if (!isConnected) {
    return createMockRedisClient();
  }
  
  return client;
}

// Check if Redis Stack modules are available
async function checkRedisStackCapabilities(client: ReturnType<typeof createClient>) {
  try {
    // Try JSON.GET command (Redis Stack JSON module)
    await client.sendCommand(['JSON.GET', 'test-key', '$']);
    return true;
  } catch (error: any) {
    // If error is about missing key, JSON module exists
    if (error.message?.includes('could not perform this operation on a key that doesn\'t exist') || 
        error.message?.includes('ERR no such key')) {
      console.log('✅ Redis Stack JSON module detected');
      return true;
    }
    
    try {
      // Try FT._LIST command (Redis Stack Search module)
      await client.sendCommand(['FT._LIST']);
      return true;
    } catch {
      console.log('Redis Stack modules not detected - using fallback');
      return false;
    }
  }
}

// Enhanced Redis client that wraps basic Redis with Stack-like methods
function createEnhancedRedisClient(basicClient: ReturnType<typeof createClient>) {
  return {
    ...basicClient,
    json: {
      set: async (key: string, path: string, value: unknown) => {
        // Fallback to regular hash storage
        return await basicClient.hSet(key, 'data', JSON.stringify(value));
      },
      get: async (key: string) => {
        try {
          const data = await basicClient.hGet(key, 'data');
          return data ? JSON.parse(data) : null;
        } catch {
          return null;
        }
      }
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
    }
  };
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