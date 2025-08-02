import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const client = await getRedisClient();
    const keys = await client.keys('receipt:*');
    const receipts = [];
    
    for (const key of keys) {
      const receiptData = await client.hGetAll(key) as Record<string, string>;
      if (receiptData.id) {
        try {
          receipts.push({
            ...receiptData,
            items: JSON.parse(receiptData.items || '[]')
          });
        } catch (parseError) {
          console.error('JSON parse error for receipt:', key, parseError);
          // Skip malformed receipts
        }
      }
    }
    
    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json({ error: 'Failed to get receipts' }, { status: 500 });
  }
}