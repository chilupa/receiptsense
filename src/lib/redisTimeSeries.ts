import { getRedisClient } from './redis';

// Initialize time series for an item
export async function initItemTimeSeries(itemName: string) {
  const client = await getRedisClient();
  const key = `price:${itemName.toLowerCase().replace(/\s+/g, '_')}`;
  
  try {
    await client.ts.create(key, {
      RETENTION: 86400000, // 24 hours in milliseconds
      LABELS: { item: itemName, type: 'price' }
    });
  } catch {
    // Time series might already exist, ignore error
    console.log(`Time series for ${itemName} already exists or created`);
  }
}

// Add price data point to time series
export async function addPricePoint(itemName: string, price: number, storeName: string) {
  const client = await getRedisClient();
  const key = `price:${itemName.toLowerCase().replace(/\s+/g, '_')}`;
  
  try {
    // Initialize if doesn't exist
    await initItemTimeSeries(itemName);
    
    // Add price point with current timestamp
    await client.ts.add(key, Date.now(), price, {
      LABELS: { store: storeName }
    });
    
    console.log(`Added price point for ${itemName}: $${price} at ${storeName}`);
  } catch (error) {
    console.error('Failed to add price point:', error);
  }
}

// Get price trend for an item
export async function getPriceTrend(itemName: string, hours: number = 24) {
  const client = await getRedisClient();
  const key = `price:${itemName.toLowerCase().replace(/\s+/g, '_')}`;
  const fromTime = Date.now() - (hours * 60 * 60 * 1000);
  
  try {
    const data = await client.ts.range(key, fromTime, '+');
    return data.map(point => ({
      timestamp: point.timestamp,
      price: point.value,
      date: new Date(point.timestamp)
    }));
  } catch (error) {
    // Key doesn't exist yet, return empty array
    return [];
  }
}

// Get average price over time period
export async function getAveragePrice(itemName: string, hours: number = 24) {
  const client = await getRedisClient();
  const key = `price:${itemName.toLowerCase().replace(/\s+/g, '_')}`;
  const fromTime = Date.now() - (hours * 60 * 60 * 1000);
  
  try {
    const result = await client.ts.range(key, fromTime, '+', {
      AGGREGATION: { type: 'avg', timeBucket: hours * 60 * 60 * 1000 }
    });
    
    return result.length > 0 ? result[0].value : null;
  } catch {
    // Key doesn't exist yet
    return null;
  }
}

// Get price statistics
export async function getPriceStats(itemName: string, hours: number = 24) {
  const client = await getRedisClient();
  const key = `price:${itemName.toLowerCase().replace(/\s+/g, '_')}`;
  const fromTime = Date.now() - (hours * 60 * 60 * 1000);
  
  try {
    const [minResult, maxResult, avgResult] = await Promise.all([
      client.ts.range(key, fromTime, '+', { AGGREGATION: { type: 'min', timeBucket: hours * 60 * 60 * 1000 } }),
      client.ts.range(key, fromTime, '+', { AGGREGATION: { type: 'max', timeBucket: hours * 60 * 60 * 1000 } }),
      client.ts.range(key, fromTime, '+', { AGGREGATION: { type: 'avg', timeBucket: hours * 60 * 60 * 1000 } })
    ]);
    
    return {
      min: minResult.length > 0 ? minResult[0].value : null,
      max: maxResult.length > 0 ? maxResult[0].value : null,
      avg: avgResult.length > 0 ? avgResult[0].value : null
    };
  } catch {
    // Key doesn't exist yet
    return { min: null, max: null, avg: null };
  }
}