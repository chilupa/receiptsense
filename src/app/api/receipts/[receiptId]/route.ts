import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    const client = await getRedisClient();
    
    // Get receipt data to find associated items
    const receiptData = await client.hGetAll(`receipt:${receiptId}`) as Record<string, string>;
    
    if (!receiptData.id) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    
    // Parse items to delete them individually
    const items = JSON.parse(receiptData.items || '[]');
    
    // Delete each item and remove from search sets
    for (const item of items) {
      await client.del(`item:${item.id}`);
      await client.sRem(`items:${item.name.toLowerCase()}`, item.id);
    }
    
    // Delete the receipt itself
    await client.del(`receipt:${receiptId}`);
    
    return NextResponse.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Delete receipt error:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
}