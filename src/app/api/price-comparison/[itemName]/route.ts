import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarItems } from '@/lib/vectorSearch';
import { getPriceTrend, getPriceStats } from '@/lib/redisTimeSeries';

interface Item {
  id: string;
  name: string;
  price: number;
  storeName: string;
  similarity: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemName: string }> }
) {
  try {
    const { itemName: rawItemName } = await params;
    const itemName = decodeURIComponent(rawItemName);
    
    // Use vector search to find similar items
    const similarItems = await searchSimilarItems(itemName, 50);
    
    if (similarItems.length === 0) {
      return NextResponse.json({ message: 'No similar items found' });
    }
    
    // Items are already processed from vector search
    const items = similarItems;
    
    const prices = items.map((item: Item) => item.price);
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    
    const storeComparison: { [key: string]: number[] } = {};
    items.forEach((item: Item) => {
      if (!storeComparison[item.storeName]) {
        storeComparison[item.storeName] = [];
      }
      storeComparison[item.storeName].push(item.price);
    });
    
    const storeAverages = Object.entries(storeComparison).map(([store, prices]) => ({
      store,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length
    }));
    
    // Calculate min/max from store averages, not individual items
    const storeAvgPrices = storeAverages.map(s => s.avgPrice);
    const minPrice = Math.min(...storeAvgPrices);
    const maxPrice = Math.max(...storeAvgPrices);
    
    const recommendations = [];
    
    // 1. Price comparison insights
    const userLastPrice = items[0]?.price || avgPrice; // Most recent/relevant price
    const priceDiffPercent = ((userLastPrice - avgPrice) / avgPrice) * 100;
    
    if (priceDiffPercent > 15) {
      recommendations.push({
        type: 'overpaid',
        message: `You paid ${priceDiffPercent.toFixed(1)}% more than average ($${userLastPrice.toFixed(2)} vs $${avgPrice.toFixed(2)})`,
        savings: userLastPrice - avgPrice
      });
    } else if (priceDiffPercent < -10) {
      recommendations.push({
        type: 'good_deal',
        message: `Great deal! You paid ${Math.abs(priceDiffPercent).toFixed(1)}% less than average`,
        savings: avgPrice - userLastPrice
      });
    }
    
    // 2. Best store recommendation
    const bestStore = storeAverages.reduce((min, store) => 
      store.avgPrice < min.avgPrice ? store : min
    );
    const worstStore = storeAverages.reduce((max, store) => 
      store.avgPrice > max.avgPrice ? store : max
    );
    
    if (storeAverages.length > 1) {
      const storeSavings = worstStore.avgPrice - bestStore.avgPrice;
      recommendations.push({
        type: 'store_recommendation',
        message: `${bestStore.store} has the best prices - save $${storeSavings.toFixed(2)} vs ${worstStore.store}`,
        savings: storeSavings
      });
    }
    
    // 3. Price range insights
    const priceRange = maxPrice - minPrice;
    const rangePercent = (priceRange / avgPrice) * 100;
    
    if (rangePercent > 30) {
      recommendations.push({
        type: 'price_volatility',
        message: `High price variation: ${rangePercent.toFixed(1)}% difference between stores ($${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)})`,
        savings: priceRange
      });
    }
    
    // 4. Similarity and alternatives
    const highSimilarityItems = items.filter((item: Item) => item.similarity && item.similarity > 0.8);
    if (highSimilarityItems.length > 3) {
      const avgSimilarPrice = highSimilarityItems.reduce((sum: number, item: Item) => sum + item.price, 0) / highSimilarityItems.length;
      recommendations.push({
        type: 'alternatives',
        message: `Found ${highSimilarityItems.length} similar items averaging $${avgSimilarPrice.toFixed(2)}`,
        savings: Math.abs(avgPrice - avgSimilarPrice)
      });
    }
    
    // 5. Cheapest option with context
    const cheapestItem = items.reduce((min: Item, item: Item) => item.price < min.price ? item : min);
    if (cheapestItem.price < avgPrice * 0.85) {
      const savingsPercent = ((avgPrice - cheapestItem.price) / avgPrice) * 100;
      recommendations.push({
        type: 'best_deal',
        message: `Best deal: ${cheapestItem.storeName} at $${cheapestItem.price.toFixed(2)} (${savingsPercent.toFixed(1)}% below average)`,
        savings: avgPrice - cheapestItem.price
      });
    }
    
    // 6. Time series trend analysis
    const priceTrend = await getPriceTrend(itemName, 24);
    const priceStats = await getPriceStats(itemName, 24);
    
    if (priceTrend.length > 1) {
      const oldestPrice = priceTrend[0].price;
      const newestPrice = priceTrend[priceTrend.length - 1].price;
      const trendPercent = ((newestPrice - oldestPrice) / oldestPrice) * 100;
      
      if (Math.abs(trendPercent) > 5) {
        const direction = trendPercent > 0 ? 'increased' : 'decreased';
        recommendations.push({
          type: 'price_trend',
          message: `Price has ${direction} ${Math.abs(trendPercent).toFixed(1)}% in the last 24 hours`,
          savings: Math.abs(newestPrice - oldestPrice)
        });
      }
    }
    
    if (priceStats.min && priceStats.max && priceStats.avg) {
      recommendations.push({
        type: 'time_analysis',
        message: `24h range: $${priceStats.min.toFixed(2)} - $${priceStats.max.toFixed(2)} (avg: $${priceStats.avg.toFixed(2)})`,
        savings: priceStats.max - priceStats.min
      });
    }
    
    return NextResponse.json({
      itemName,
      totalItems: items.length,
      priceStats: { avgPrice, minPrice, maxPrice },
      storeComparison: storeAverages,
      recommendations
    });
  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json({ error: 'Failed to get price comparison' }, { status: 500 });
  }
}