# Receipt Sense 🧾

An intelligent receipt analysis application that leverages **Redis 8** and **Redis Stack** to provide advanced price comparison, vector-based item similarity search, and real-time analytics across different stores.

## 🌐 Live Demo

**Project is live here:** [receiptsense.vercel.app](https://receiptsense.vercel.app/)

## 🚀 Project Overview

This Next.js application transforms receipt data into actionable insights using cutting-edge database technologies. By combining OCR processing with Redis Stack's advanced modules, it delivers:

- **Smart Price Analysis**: Compare prices across stores with statistical insights
- **Vector Similarity Search**: Find similar items using AI-powered embeddings
- **Real-time Recommendations**: Get instant savings suggestions
- **Trend Analysis**: Track price movements over time
- **Store Performance**: Analyze which stores offer the best deals

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes with TypeScript
- **Database**: Redis Cloud 8.0 with Redis Stack
- **OCR Engine**: Tesseract.js for receipt text extraction
- **Deployment**: Vercel with serverless functions
- **Code Quality**: Husky, ESLint, TypeScript

## 🏗️ Architecture

### Data Flow

1. **Receipt Upload** → OCR Processing (Tesseract.js)
2. **Item Extraction** → Vector Embedding Generation
3. **Redis Storage** → JSON documents with vector indices
4. **Similarity Search** → KNN search using cosine distance
5. **Price Analysis** → Statistical comparison across stores
6. **Recommendations** → Real-time insights and savings suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- Redis Cloud account with Redis Stack enabled

### Installation

```bash
git clone <repository-url>
npm install
```

### Environment Setup

```env
# Redis Cloud with Redis Stack
REDIS_URL=redis://default:password@redis-xxxxx.c91.us-east-1-3.ec2.redns.redis-cloud.com:port
NODE_ENV=development
```

### Development

```bash
npm run dev    # Start development server
npm run lint   # Run ESLint
npm run build  # Build for production
```

## 📊 Features Deep Dive

### Vector Similarity Search

- **128-dimensional embeddings** for item names
- **Cosine similarity** for finding related products
- **KNN search** with configurable result limits
- **Automatic filtering** of zero-price items

### Price Analysis Engine

- **Store comparison** with statistical insights
- **Price volatility detection** (>30% variation alerts)
- **Savings recommendations** based on historical data
- **Trend analysis** using time series data

### Smart Recommendations

- **Overpaid alerts** (>15% above average)
- **Good deal detection** (>10% below average)
- **Store recommendations** based on price performance
- **Alternative product suggestions** with high similarity scores

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy with automatic Redis Stack detection

### Environment Variables

- `REDIS_URL`: Redis Cloud connection string with Redis Stack
- `NODE_ENV`: Production environment flag

## 📈 Performance Optimizations

- **Vector search caching** for frequently queried items
- **Connection pooling** with Redis client reuse
- **Graceful fallbacks** when Redis Stack unavailable
- **Efficient embedding generation** with normalized vectors
- **Smart filtering** to exclude invalid price data

## 🔍 API Endpoints

| Endpoint                           | Method | Description                      |
| ---------------------------------- | ------ | -------------------------------- |
| `/api/upload-receipt`              | POST   | Upload and OCR process receipts  |
| `/api/receipts`                    | GET    | Retrieve all stored receipts     |
| `/api/receipts/[id]`               | GET    | Get specific receipt details     |
| `/api/receipts/[id]/edit`          | PUT    | Update receipt information       |
| `/api/price-comparison/[itemName]` | GET    | Vector search and price analysis |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Redis 8, Redis Stack, and Next.js**
