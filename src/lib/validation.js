import { z } from "zod";
import { ObjectId } from "mongodb";
import { HttpError } from "./errors.js";

export const categories = ["Fiction", "Science", "History", "Kids", "Others"];
export const bookSchema = z.object({
  title: z.string().trim().min(1, "Book title is required.").max(160),
  author: z.string().trim().min(1, "Author name is required.").max(120),
  category: z.enum(categories),
  image: z.url().refine(value => value.startsWith("https://"), "Use an HTTPS image URL."),
  description: z.string().trim().min(10, "Write at least 10 characters about the book.").max(3000),
  totalCopies: z.number().int().min(0).max(10000),
}).strict();

export function objectId(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value)) throw new HttpError(400, "Invalid record ID.");
  return new ObjectId(value);
}
export function borrowDates(now = new Date()) {
  return { borrowDate: now, returnDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) };
}
