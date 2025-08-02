import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '@/lib/redis';
import { createEmbedding, initializeVectorIndex } from '@/lib/vectorSearch';
import { addReceiptEvent, addPriceEvent } from '@/lib/redisStreams';
import { addPricePoint } from '@/lib/redisTimeSeries';

function parseReceiptText(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  const items = [];
  
  for (const line of lines) {
    const match = line.match(/(.+?)\s+\$?(\d+\.\d{2})/);
    if (match) {
      const [, name, price] = match;
      items.push({
        name: name.trim(),
        price: parseFloat(price),
        id: uuidv4()
      });
    }
  }
  
  return items;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting receipt upload...');
    const formData = await request.formData();
    const extractedText = formData.get('extractedText') as string;
    const storeName = formData.get('storeName') as string || 'Unknown Store';
    
    if (!extractedText) {
      return NextResponse.json({ error: 'No extracted text provided' }, { status: 400 });
    }

    console.log('Extracted text received:', extractedText.substring(0, 200));
    const receiptId = uuidv4();
    
    // Parse the extracted text
    const items = parseReceiptText(extractedText);
    console.log('Parsed items:', items);
    
    // Store in Redis
    console.log('Connecting to Redis...');
    const client = await getRedisClient();
    console.log('Redis connected successfully');
    const receiptData = {
      id: receiptId,
      storeName,
      items: JSON.stringify(items),
      timestamp: new Date().toISOString()
    };
    
    await client.hSet(`receipt:${receiptId}`, receiptData);
    
    // Initialize vector index if needed
    await initializeVectorIndex();
    
    // Store items with vector embeddings for search
    for (const item of items) {
      const itemKey = `item:${item.id}`;
      const embedding = createEmbedding(item.name);
      
      // Store as JSON for Redis Stack vector search
      await client.json.set(itemKey, '$', {
        id: item.id,
        name: item.name,
        price: item.price,
        receiptId,
        storeName,
        timestamp: receiptData.timestamp,
        name_vector: embedding
      });
      
      // Keep the old method for fallback
      await client.sAdd(`items:${item.name.toLowerCase()}`, item.id);
      
      // Add to streams and time series
      await addPriceEvent(item.name, item.price, storeName);
      await addPricePoint(item.name, item.price, storeName);
    }
    
    // Add receipt event to stream
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    await addReceiptEvent(receiptId, storeName, items, totalAmount);
    
    return NextResponse.json({
      receiptId,
      items,
      message: 'Receipt processed successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}