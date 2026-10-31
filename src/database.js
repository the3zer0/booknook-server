import { MongoClient } from "mongodb";
import { config } from "./config.js";

let client;
export async function connectDatabase() {
  if (!config.mongoUri) throw new Error("Set MONGODB_URI in .env before starting the API.");
  client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(config.database);
  await Promise.all([
    db.collection("books").createIndex({ createdAt: -1 }),
    db.collection("books").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("borrows").createIndex({ bookId: 1, userId: 1 }, { unique: true }),
    db.collection("borrows").createIndex({ userId: 1, borrowDate: -1 }),
  ]);
  return { client, db };
}
export async function closeDatabase() { await client?.close(); }
