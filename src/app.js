import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./lib/errors.js";
import { createRoutes } from "./routes.js";

export function createApp(database, auth) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json({ limit: "50kb" }));
  app.use(createRoutes(database, auth));
  app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
  app.use(errorHandler);
  return app;
}
