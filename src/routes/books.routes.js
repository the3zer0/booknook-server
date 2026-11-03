import { Router } from "express";
import { bookControllers } from "../controllers/books.controller.js";

export function booksRoutes(database, auth) {
  const router = Router();
  const books = bookControllers(database);
  router.get(
    "/books",
    (req, res, next) =>
      req.query.mine === "true" ? auth(req, res, next) : next(),
    books.list,
  );
  router.get("/books/:id", auth, books.detail);
  router.post("/books", auth, books.create);
  router.patch("/books/:id", auth, books.update);
  router.delete("/books/:id", auth, books.remove);
  return router;
}
