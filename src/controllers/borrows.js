import { z } from "zod";
import { objectId, borrowDates } from "../lib/validation.js";
import { HttpError } from "../lib/errors.js";

export function borrowControllers({ db, client }) {
  const books = db.collection("books");
  const borrows = db.collection("borrows");
  return {
    async list(req, res) {
      res.json(await borrows.find({ userId: req.user.id }).sort({ borrowDate: -1 }).toArray());
    },
    async create(req, res) {
      const input = z.object({ bookId: z.string() }).strict().parse(req.body);
      const bookId = objectId(input.bookId);
      const session = client.startSession();
      let record;
      try {
        await session.withTransaction(async () => {
          if (await borrows.findOne({ bookId, userId: req.user.id }, { session })) throw new HttpError(409, "You already borrowed this book. Return it first.");
          const book = await books.findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }, { session, returnDocument: "after" });
          if (!book) throw new HttpError(409, "This book is not available to borrow.");
          record = { bookId, bookTitle: book.title, bookImage: book.image, userId: req.user.id, userEmail: req.user.email, ...borrowDates() };
          const result = await borrows.insertOne(record, { session });
          record._id = result.insertedId;
        });
      } finally { await session.endSession(); }
      res.status(201).json(record);
    },
    async remove(req, res) {
      const _id = objectId(req.params.id);
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          const record = await borrows.findOne({ _id }, { session });
          if (!record) throw new HttpError(404, "Borrow record not found or already returned.");
          if (record.userId !== req.user.id) throw new HttpError(403, "You can only return your own borrowed books.");
          const result = await books.updateOne({ _id: record.bookId }, { $inc: { availableCopies: 1 } }, { session });
          if (!result.matchedCount) throw new HttpError(409, "The original book could not be found. Please contact the library.");
          await borrows.deleteOne({ _id }, { session });
        });
      } finally { await session.endSession(); }
      res.json({ message: "Book returned. Thank you for sharing the shelf." });
    },
  };
}
