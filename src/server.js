import { config } from "./config/index.js";
import { connectDatabase, closeDatabase } from "./database/connection.js";
import { createApp } from "./app.js";

try {
  const database = await connectDatabase();
  const server = createApp(database).listen(config.port, () => console.log(`BookNook API: http://localhost:${config.port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => server.close(async () => { await closeDatabase(); process.exit(0); }));
  }
} catch (error) {
  console.error(error.message);
  await closeDatabase();
  process.exitCode = 1;
}
