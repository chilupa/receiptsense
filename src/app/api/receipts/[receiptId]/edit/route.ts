import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { createEmbedding } from '@/lib/vectorSearch';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    const { items, storeName } = await request.json();
    const client = await getRedisClient();
    
    // Get existing receipt
    const receiptData = await client.hGetAll(`receipt:${receiptId}`) as Record<string, string>;
    if (!receiptData.id) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    
    // Delete old items
    const oldItems = JSON.parse(receiptData.items || '[]');
    for (const item of oldItems) {
      await client.del(`item:${item.id}`);
      await client.sRem(`items:${item.name.toLowerCase()}`, item.id);
    }
    
    // Update receipt data
    const updatedReceiptData = {
      ...receiptData,
      items: JSON.stringify(items),
      storeName: storeName || receiptData.storeName
    };
    
    await client.hSet(`receipt:${receiptId}`, updatedReceiptData);
    
    // Store updated items with vector embeddings
    for (const item of items) {
      const itemKey = `item:${item.id}`;
      const embedding = createEmbedding(item.name);
      
      await client.json.set(itemKey, '$', {
        id: item.id,
        name: item.name,
        price: item.price,
        receiptId,
        storeName: storeName || receiptData.storeName,
        timestamp: receiptData.timestamp,
        name_vector: embedding
      });
      
      await client.sAdd(`items:${item.name.toLowerCase()}`, item.id);
    }
    
    return NextResponse.json({
      receiptId,
      items,
      message: 'Receipt updated successfully'
    });
  } catch (error) {
    console.error('Edit receipt error:', error);
    return NextResponse.json({ error: 'Failed to update receipt' }, { status: 500 });
  }
}