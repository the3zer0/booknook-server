import { bookSchema, categories } from "../validations/books.schema.js";
import { objectId } from "../validations/common.js";
import { HttpError } from "../utils/errors.js";

export function bookControllers({ db, client }) {
  const books = db.collection("books");
  const borrows = db.collection("borrows");
  return {
    async list(req, res) {
      const filter = {};
      if (req.query.mine === "true") filter.userId = req.user.id;
      if (req.query.category && req.query.category !== "All") {
        if (!categories.includes(req.query.category)) throw new HttpError(400, "Unknown category.");
        filter.category = req.query.category;
      }
      const rawLimit = req.query.limit;
      if (rawLimit && (!/^\d+$/.test(rawLimit) || Number(rawLimit) < 1 || Number(rawLimit) > 100)) throw new HttpError(400, "Limit must be between 1 and 100.");
      const projection = req.query.mine === "true" ? {} : { userEmail: 0, userId: 0 };
      let cursor = books.find(filter, { projection }).sort({ createdAt: -1, _id: -1 });
      if (rawLimit) cursor = cursor.limit(Number(rawLimit));
      res.json(await cursor.toArray());
    },
    async detail(req, res) {
      const book = await books.findOne({ _id: objectId(req.params.id) });
      if (!book) throw new HttpError(404, "Book not found.");
      res.json(book);
    },
    async create(req, res) {
      const input = bookSchema.parse(req.body);
      const book = { ...input, availableCopies: input.totalCopies, userId: req.user.id, userName: req.user.name, userEmail: req.user.email, createdAt: new Date() };
      const result = await books.insertOne(book);
      res.status(201).json({ ...book, _id: result.insertedId });
    },
    async update(req, res) {
      const _id = objectId(req.params.id);
      const input = bookSchema.parse(req.body);
      const session = client.startSession();
      let updated;
      try {
        await session.withTransaction(async () => {
          const book = await books.findOne({ _id }, { session });
          if (!book) throw new HttpError(404, "Book not found.");
          if (book.userId !== req.user.id) throw new HttpError(403, "You can only edit your own books.");
          const borrowed = book.totalCopies - book.availableCopies;
          if (input.totalCopies < borrowed) throw new HttpError(409, `At least ${borrowed} copies are currently borrowed.`);
          updated = await books.findOneAndUpdate({ _id }, { $set: { ...input, availableCopies: input.totalCopies - borrowed, updatedAt: new Date() } }, { session, returnDocument: "after" });
        });
      } finally { await session.endSession(); }
      res.json(updated);
    },
    async remove(req, res) {
      const _id = objectId(req.params.id);
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          const book = await books.findOne({ _id }, { session });
          if (!book) throw new HttpError(404, "Book not found.");
          if (book.userId !== req.user.id) throw new HttpError(403, "You can only delete your own books.");
          if (await borrows.findOne({ bookId: _id }, { session })) throw new HttpError(409, "Wait for all borrowed copies to be returned before deleting this book.");
          await books.deleteOne({ _id }, { session });
        });
      } finally { await session.endSession(); }
      res.json({ message: "Book deleted." });
    },
  };
}
