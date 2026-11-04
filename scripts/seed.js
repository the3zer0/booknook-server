import "dotenv/config";
import { connectDatabase, closeDatabase } from "../src/database/connection.js";

// Seed only on explicit invocation. Existing user books are never overwritten.
const samples = [
  ["Pride and Prejudice", "Jane Austen", "Fiction", "pride", "Elizabeth Bennet meets the proud Mr Darcy in a sharp, warm story about first impressions, family and finding your own way."],
  ["The Secret Garden", "Frances Hodgson Burnett", "Kids", "garden", "A hidden garden, an unlikely friendship and a curious child bring new life to a quiet house on the Yorkshire moors."],
  ["The Cosmos", "BookNook Reading Circle", "Science", "cosmos", "An introductory community reading guide to stars, planets and the questions that make us look up at the night sky."],
  ["A Short History", "BookNook Reading Circle", "History", "history", "A community reading guide tracing how everyday people, shared ideas and small decisions shaped the world around us."],
  ["A Little Wonder", "BookNook Reading Circle", "Kids", "wonder", "A sample collection of gentle adventures for curious young readers, celebrating friendship, imagination and little discoveries."],
  ["Into the Wild", "BookNook Reading Circle", "Others", "wild", "A sample nature journal about paying attention to familiar trees, changing seasons and the quiet life just outside our doors."],
];
try {
  const { db } = await connectDatabase();
  for (const [index, [title, author, category, cover, description]] of samples.entries()) {
    await db.collection("books").updateOne({ seedKey: cover }, { $setOnInsert: {
      title, author, category, description, image: `/covers/${cover}.svg`, totalCopies: 3, availableCopies: 3,
      userId: "pataghor-library", userName: "BookNook Library", userEmail: "library@pataghor.example",
      createdAt: new Date(Date.now() - index * 86400000), seedKey: cover,
    } }, { upsert: true });
  }
  console.log("Six sample books are ready. Sample guides are explicitly fictional demonstration content.");
} finally { await closeDatabase(); }
