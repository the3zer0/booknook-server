import { Router } from "express";
import { requireAuth } from "./middleware/auth.js";
import { bookControllers } from "./controllers/books.js";
import { borrowControllers } from "./controllers/borrows.js";

export function createRoutes(database, auth = requireAuth) {
  const router = Router();
  const books = bookControllers(database);
  const borrows = borrowControllers(database);
  router.get("/books", (req, res, next) => req.query.mine === "true" ? auth(req, res, next) : next(), books.list);
  router.get("/books/:id", auth, books.detail);
  router.post("/books", auth, books.create);
  router.patch("/books/:id", auth, books.update);
  router.delete("/books/:id", auth, books.remove);
  router.post("/borrows", auth, borrows.create);
  router.get("/borrows", auth, borrows.list);
  router.delete("/borrows/:id", auth, borrows.remove);
  return router;
}
