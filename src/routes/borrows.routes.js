import { Router } from "express";
import { borrowControllers } from "../controllers/borrows.controller.js";

export function borrowsRoutes(database, auth) {
  const router = Router();
  const borrows = borrowControllers(database);
  router.post("/borrows", auth, borrows.create);
  router.get("/borrows", auth, borrows.list);
  router.delete("/borrows/:id", auth, borrows.remove);
  return router;
}
