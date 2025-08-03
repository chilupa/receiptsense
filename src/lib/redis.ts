import { createClient } from "redis";

// Railway-specific Redis URL handling
const redisUrl =
  process.env.REDIS_URL ||
  process.env.REDIS_PRIVATE_URL ||
  process.env.REDIS_PUBLIC_URL ||
  "redis://localhost:6379";

const client = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

let isConnected = false;
let connectionAttempted = false;

export async function getRedisClient() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      console.log("Connecting to Redis...");
      await client.connect();
      isConnected = true;
      console.log("✅ Redis connected successfully");
    } catch (error) {
      console.error("❌ Redis connection failed:", (error as Error).message);
      console.error("Environment:", process.env.NODE_ENV);
      console.error("Redis URL:", process.env.REDIS_URL);
      console.log("⚠️  App will run without Redis features");
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
    hSet: async () => "OK",
    hGetAll: async () => ({}),
    sAdd: async () => 1,
    sMembers: async () => [],
    keys: async () => [],
    del: async () => 1,
    sRem: async () => 1,
    json: {
      set: async () => "OK",
      get: async () => null,
    },
    ft: {
      search: async () => ({ documents: [] }),
      create: async () => "OK",
      info: async () => ({}),
    },
    ts: {
      create: async () => "OK",
      add: async () => "OK",
      range: async () => [],
    },
    xAdd: async () => "1-0",
    xRevRange: async () => [],
  };
}
