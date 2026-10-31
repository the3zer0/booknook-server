import test from "node:test";
import assert from "node:assert/strict";
import { bookSchema, objectId, borrowDates } from "../src/lib/validation.js";

const book = { title: "A book", author: "A writer", category: "Fiction", image: "https://i.ibb.co/example.jpg", description: "A thoughtful story about home.", totalCopies: 2 };
test("rejects forged ownership and stock fields", () => {
  assert.throws(() => bookSchema.parse({ ...book, userId: "another-user" }));
  assert.throws(() => bookSchema.parse({ ...book, availableCopies: 999 }));
});
test("rejects invalid copies, categories and unsafe image protocols", () => {
  for (const totalCopies of [-1, 0.5, "2"]) assert.throws(() => bookSchema.parse({ ...book, totalCopies }));
  assert.throws(() => bookSchema.parse({ ...book, category: "Unknown" }));
  assert.throws(() => bookSchema.parse({ ...book, image: "javascript:alert(1)" }));
  assert.equal(bookSchema.parse({ ...book, totalCopies: 0 }).totalCopies, 0);
});
test("object IDs reject malformed input", () => {
  assert.throws(() => objectId("not-an-id"));
  assert.throws(() => objectId({ $ne: null }));
  assert.equal(objectId("507f1f77bcf86cd799439011").toHexString(), "507f1f77bcf86cd799439011");
});
test("return date is exactly fourteen days later across month boundaries", () => {
  const dates = borrowDates(new Date("2026-10-31T18:00:00Z"));
  assert.equal(dates.returnDate.toISOString(), "2026-11-14T18:00:00.000Z");
});
