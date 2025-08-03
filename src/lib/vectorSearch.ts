import { getRedisClient } from './redis';

interface SearchDocument {
  id: string;
  value: {
    name: string;
    price: string;
    store: string;
    __vector_score: string;
  };
}

interface SearchResults {
  documents: SearchDocument[];
}

// Simple embedding function for item names
export function createEmbedding(text: string): number[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const embedding = new Array(128).fill(0);
  
  // Create a simple but effective embedding
  words.forEach((word, wordIndex) => {
    for (let i = 0; i < word.length && i < 32; i++) {
      const charCode = word.charCodeAt(i);
      const pos = (wordIndex * 32 + i) % 128;
      embedding[pos] += charCode * (wordIndex + 1);
    }
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Initialize vector search index
export async function initializeVectorIndex() {
  const client = await getRedisClient();
  
  try {
    // Check if index already exists
    await client.ft.info('item_idx');
    console.log('Vector index already exists');
  } catch {
    // Create the index if it doesn't exist
    try {
      await client.ft.create('item_idx', {
        '$.name': {
          type: 'TEXT',
          AS: 'name'
        },
        '$.name_vector': {
          type: 'VECTOR',
          ALGORITHM: 'FLAT',
          TYPE: 'FLOAT32',
          DIM: 128,
          DISTANCE_METRIC: 'COSINE',
          AS: 'vector'
        },
        '$.price': {
          type: 'NUMERIC',
          AS: 'price'
        },
        '$.storeName': {
          type: 'TEXT',
          AS: 'store'
        }
      }, {
        ON: 'JSON',
        PREFIX: 'item:'
      });
      console.log('Vector index created successfully');
    } catch (createError) {
      console.error('Failed to create vector index:', createError);
    }
  }
}

// Search for similar items using vector similarity
export async function searchSimilarItems(itemName: string, limit: number = 10) {
  const client = await getRedisClient();
  const queryVector = createEmbedding(itemName);
  
  try {
    // Convert to buffer for Redis
    const vectorBuffer = Buffer.from(new Float32Array(queryVector).buffer);
    
    const results = await client.ft.search('item_idx', '*=>[KNN 10 @vector $vec]', {
      PARAMS: {
        vec: vectorBuffer
      },
      RETURN: ['name', 'price', 'store', '__vector_score'],
      SORTBY: {
        BY: '__vector_score',
        DIRECTION: 'ASC'
      },
      LIMIT: { from: 0, size: limit }
    });
    
    const searchResults = results as SearchResults;
    return searchResults?.documents?.map(doc => ({
      id: doc.id.replace('item:', ''),
      name: doc.value.name as string,
      price: parseFloat(doc.value.price as string),
      storeName: doc.value.store as string,
      similarity: 1 - parseFloat(doc.value.__vector_score as string) // Convert distance to similarity
    })) || [];
  } catch (err) {
    console.error('Vector search failed:', err);
    return [];
  }
}