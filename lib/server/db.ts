import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'family_hub';

if (!uri) {
  // In Vercel / production this must be set; for local dev, we throw a clear error.
  // We avoid throwing at import time to keep build working; runtime calls will fail with message.
  console.warn(
    '[db] MONGODB_URI is not set. Backend API routes will fail until it is configured.'
  );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return db;
}

