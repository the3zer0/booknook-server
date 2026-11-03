import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { booksRoutes } from "./books.routes.js";
import { borrowsRoutes } from "./borrows.routes.js";

export function createRoutes(database, auth = requireAuth) {
  return Router().use(
    booksRoutes(database, auth),
    borrowsRoutes(database, auth),
  );
}
