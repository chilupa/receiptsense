import { getRedisClient } from './redis';

// Add receipt event to stream
interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

export async function addReceiptEvent(receiptId: string, storeName: string, items: ReceiptItem[], totalAmount: number) {
  const client = await getRedisClient();
  
  try {
    await client.xAdd('receipt-stream', '*', {
      event: 'receipt_uploaded',
      receiptId,
      storeName,
      itemCount: items.length.toString(),
      totalAmount: totalAmount.toString(),
      timestamp: Date.now().toString()
    });
    
    console.log('Receipt event added to stream');
  } catch (error) {
    console.error('Failed to add receipt event:', error);
  }
}

// Add price event to stream
export async function addPriceEvent(itemName: string, price: number, storeName: string) {
  const client = await getRedisClient();
  
  try {
    await client.xAdd('price-stream', '*', {
      event: 'price_recorded',
      itemName,
      price: price.toString(),
      storeName,
      timestamp: Date.now().toString()
    });
    
    console.log('Price event added to stream');
  } catch (error) {
    console.error('Failed to add price event:', error);
  }
}

// Get recent receipt events
export async function getRecentReceiptEvents(count: number = 10) {
  const client = await getRedisClient();
  
  try {
    const events = await client.xRevRange('receipt-stream', '+', '-', { COUNT: count });
    return events.map(event => ({
      id: event.id,
      timestamp: parseInt(event.message.timestamp),
      receiptId: event.message.receiptId,
      storeName: event.message.storeName,
      itemCount: parseInt(event.message.itemCount),
      totalAmount: parseFloat(event.message.totalAmount)
    }));
  } catch (error) {
    console.error('Failed to get receipt events:', error);
    return [];
  }
}