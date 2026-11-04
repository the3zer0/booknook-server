import "dotenv/config";
import { connectDatabase, closeDatabase } from "../src/database/connection.js";

// Seed only on explicit invocation. Existing user books are never overwritten.
const samples = [
  ["Pride and Prejudice", "Jane Austen", "Fiction", "pride", "Elizabeth Bennet meets the proud Mr Darcy in a sharp, warm story about first impressions, family and finding your own way."],
  ["The Secret Garden", "Frances Hodgson Burnett", "Kids", "garden", "A hidden garden, an unlikely friendship and a curious child bring new life to a quiet house on the Yorkshire moors."],
  ["The Hobbit", "J. R. R. Tolkien", "Fiction", "cosmos", "Bilbo Baggins leaves his comfortable home for an unexpected journey with a company of dwarves, encountering riddles, danger and a dragon."],
  ["1984", "George Orwell", "Fiction", "history", "Winston Smith searches for truth and personal freedom in a society ruled by surveillance, propaganda and the constant rewriting of history."],
  ["To Kill a Mockingbird", "Harper Lee", "Fiction", "wonder", "Through Scout Finch’s childhood in Alabama, a family confronts prejudice, injustice and the difficult work of understanding other people."],
  ["The Great Gatsby", "F. Scott Fitzgerald", "Fiction", "wild", "Nick Carraway enters the glittering world of Jay Gatsby, where extravagant parties conceal longing, reinvention and the cost of chasing the past."],
];
try {
  const { db } = await connectDatabase();
  for (const [index, [title, author, category, cover, description]] of samples.entries()) {
    await db.collection("books").updateOne({ seedKey: cover }, { $setOnInsert: {
      title, author, category, description, image: `/covers/${cover}.jpg`, totalCopies: 3, availableCopies: 3,
      userId: "pataghor-library", userName: "BookNook Library", userEmail: "hello@booknook.example",
      createdAt: new Date(Date.now() - index * 86400000), seedKey: cover,
    } }, { upsert: true });
  }
  console.log("Six real titles are ready for the demonstration library.");
} finally { await closeDatabase(); }
