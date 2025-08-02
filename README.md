# 🧾 ReceiptSense

An AI-powered grocery receipt analyzer that uses Redis Stack for real-time price insights, vector search, and intelligent recommendations. Upload receipts, get instant OCR processing, and discover where you can save money through advanced analytics.

## ✨ Features

- **🔍 Smart OCR Processing**: Client-side Tesseract.js extracts text from receipt images
- **🎯 AI-Powered Vector Search**: Redis vector similarity finds items like "milk" matching "wholemilk"
- **💰 Intelligent Price Analysis**: Advanced recommendations with percentage insights
- **📈 Real-Time Trend Analysis**: Redis TimeSeries tracks price changes over time
- **🏪 Multi-Store Comparison**: Visual rankings show which stores offer best deals
- **📊 Receipt Management**: Full CRUD operations - view, edit, and delete receipts
- **⚡ Event Streaming**: Redis Streams capture real-time receipt and price events
- **🎨 Visual Recommendations**: Color-coded alerts for best deals and overpaid items

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS  
- **Database**: Redis Stack (Vector Search + TimeSeries + Streams + JSON)
- **OCR Engine**: Tesseract.js (Client-side AI)
- **API**: Next.js API Routes
- **Deployment**: 100% Free (Local Redis + Client-side OCR)

## 🚀 Quick Start

1. **Start Redis Stack** (required for all features):
```bash
# Using Docker (recommended)
docker run -d --name receipt-redis -p 6379:6379 redis/redis-stack:latest

# Or use the start script
./start.sh
```

2. **Install dependencies**:
```bash
npm install
```

3. **Switch to Node 20** (required for Next.js 15):
```bash
source ~/.nvm/nvm.sh && nvm use 20
```

4. **Start the app**:
```bash
npm run dev
```

5. **Open**: http://localhost:3000

6. **Upload receipts** and watch the AI-powered analysis in action! 🎉

## 🔌 API Endpoints

- `POST /api/upload-receipt` - Process receipt with vector embeddings and event streaming
- `GET /api/price-comparison/[itemName]` - AI-powered analysis with trend insights
- `GET /api/receipts` - Retrieve receipt history with analytics
- `PUT /api/receipts/[receiptId]/edit` - Edit receipt items and store information
- `DELETE /api/receipts/[receiptId]` - Delete receipts and associated data

## 🔥 Redis Stack Features

### Vector Search & AI
- **Semantic Similarity**: 128-dimensional embeddings for intelligent item matching
- **Vector Index**: FT.CREATE with COSINE distance for similarity scoring
- **Smart Recommendations**: "milk" finds "wholemilk", "almond milk", etc.
- **JSON Storage**: Structured data with vector embeddings

### TimeSeries Analytics
- **Price Trends**: Track price changes over 24-hour periods
- **Statistical Analysis**: Min/max/average calculations with Redis aggregations
- **Trend Detection**: "Price increased 12.3% in last 24 hours" insights
- **Historical Data**: Retention policies for efficient storage

### Real-Time Streams
- **Receipt Events**: Every upload tracked in `receipt-stream`
- **Price Events**: Individual item prices in `price-stream`
- **Event History**: Query recent activities and patterns
- **Real-Time Processing**: Instant event capture and analysis

### Multi-Model Database
- **Hash Storage**: Receipt metadata and relationships
- **Set Operations**: Fast item categorization and lookups
- **JSON Documents**: Structured receipt and item data
- **Search Index**: Full-text and vector search capabilities

## 🎯 Advanced Recommendations

### AI-Powered Insights
- **💰 Best Deals**: "Best deal: Walmart at $2.99 (25.1% below average)"
- **⚠️ Overpaid Alerts**: "You paid 23.5% more than average ($4.99 vs $4.05)"
- **🏪 Store Rankings**: "Target has the best prices - save $1.50 vs Kroger"
- **📈 Price Trends**: "Price has increased 8.2% in the last 24 hours"
- **📊 Time Analysis**: "24h range: $2.99 - $5.49 (avg: $4.12)"

### Visual Emphasis
- **Green highlights** for money-saving opportunities
- **Red alerts** for overpaid items
- **Blue insights** for general information
- **Percentage-based** recommendations with dollar savings

## 🎯 Key Capabilities

This project showcases Redis Stack as a **powerful AI platform** beyond simple caching:
- ✅ **Vector search** for semantic item matching
- ✅ **TimeSeries analysis** for price trend detection
- ✅ **Real-time streams** for event processing
- ✅ **Multi-model database** (JSON + Hash + Sets + Vectors)
- ✅ **Advanced analytics** with intelligent recommendations

**Experience the future of AI-powered grocery insights with Redis Stack!** 🛒✨