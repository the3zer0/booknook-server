import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import request from "supertest";
import { createApp } from "../src/app.js";

let replica; let client; let db; let app;
before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  client = new MongoClient(replica.getUri()); await client.connect(); db = client.db("integration-tests");
  await db.collection("borrows").createIndex({ bookId: 1, userId: 1 }, { unique: true });
  app = createApp({ client, db }, (req, res, next) => {
    const id = req.headers["x-test-user"];
    if (!id) return res.status(401).json({ message: "Sign in" });
    req.user = { id, name: id, email: `${id}@example.com` }; next();
  });
});
after(async () => { await client?.close(); await replica?.stop(); });
async function makeBook(totalCopies = 1) {
  const result = await request(app).post("/books").set("x-test-user", "owner").send({ title: "A shared story", author: "Writer", category: "Fiction", image: "https://i.ibb.co/cover.jpg", description: "A good story worth sharing with others.", totalCopies });
  assert.equal(result.status, 201); return result.body;
}
test("only one borrower can claim the last copy under concurrent requests", async () => {
  const book = await makeBook();
  const responses = await Promise.all(["reader-a", "reader-b"].map(user => request(app).post("/borrows").set("x-test-user", user).send({ bookId: book._id })));
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  const stored = await db.collection("books").findOne({ title: book.title });
  assert.equal(stored.availableCopies, 0);
});
test("duplicate borrowing rolls back stock; double return never adds an extra copy", async () => {
  const book = await makeBook(3);
  const first = await request(app).post("/borrows").set("x-test-user", "reader").send({ bookId: book._id });
  assert.equal(first.status, 201);
  assert.equal((await request(app).post("/borrows").set("x-test-user", "reader").send({ bookId: book._id })).status, 409);
  const responses = await Promise.all([1, 2].map(() => request(app).delete(`/borrows/${first.body._id}`).set("x-test-user", "reader")));
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 404]);
  const result = await request(app).get(`/books/${book._id}`).set("x-test-user", "reader");
  assert.equal(result.body.availableCopies, 3);
});
test("owner-only edits and deletion protect active borrows", async () => {
  const book = await makeBook(2); const { title, author, category, image, description, totalCopies } = book;
  const patch = { title, author, category, image, description, totalCopies };
  assert.equal((await request(app).patch(`/books/${book._id}`).set("x-test-user", "other").send(patch)).status, 403);
  assert.equal((await request(app).delete(`/books/${book._id}`).set("x-test-user", "other")).status, 403);
  const borrow = await request(app).post("/borrows").set("x-test-user", "reader").send({ bookId: book._id });
  assert.equal((await request(app).delete(`/books/${book._id}`).set("x-test-user", "owner")).status, 409);
  assert.equal((await request(app).patch(`/books/${book._id}`).set("x-test-user", "owner").send({ ...patch, totalCopies: 0 })).status, 409);
  assert.equal((await request(app).delete(`/borrows/${borrow.body._id}`).set("x-test-user", "other")).status, 403);
  assert.equal((await request(app).get("/borrows").set("x-test-user", "other")).body.length, 0);
  assert.equal((await request(app).delete(`/borrows/${borrow.body._id}`).set("x-test-user", "reader")).status, 200);
  assert.equal((await request(app).delete(`/books/${book._id}`).set("x-test-user", "owner")).status, 200);
});
test("public catalog supports latest six and private lists require identity", async () => {
  for (let index = 0; index < 7; index++) await makeBook();
  const response = await request(app).get("/books?limit=6");
  assert.equal(response.status, 200); assert.equal(response.body.length, 6);
  assert.ok(response.body.every(book => !("userId" in book) && !("userEmail" in book)));
  assert.ok(response.body.every((book, index, items) => !index || book.createdAt <= items[index - 1].createdAt));
  assert.equal((await request(app).get("/books?mine=true")).status, 401);
  const own = await request(app).get("/books?mine=true").set("x-test-user", "other");
  assert.equal(own.body.length, 0);
  assert.equal((await request(app).get("/books/not-an-id").set("x-test-user", "owner")).status, 400);
});
