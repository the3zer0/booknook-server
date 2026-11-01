import { MongoMemoryReplSet } from "mongodb-memory-server";
import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

const storage = resolve(".local-data/db");
await mkdir(storage, { recursive: true });
const database = await MongoMemoryReplSet.create({
  instanceOpts: [{ port: 27018, dbPath: storage }],
  replSet: { count: 1, name: "pataghor-local", storageEngine: "wiredTiger" },
});
const uri = database.getUri();
async function writeIfMissing(path, content) {
  try { await access(path); console.log(`Keeping existing ${path}`); }
  catch { await writeFile(path, content, { encoding: "utf8", mode: 0o600 }); console.log(`Created local configuration: ${path}`); }
}
await writeIfMissing(resolve(".env"), `PORT=5000\nMONGODB_URI=${uri}\nMONGODB_DB=pataghor\nCLIENT_URL=http://localhost:3000\nJWT_ISSUER=http://localhost:3000\nJWT_AUDIENCE=pataghor-api\n`);
await writeIfMissing(resolve("../booknook-client/.env.local"), `NEXT_PUBLIC_API_URL=http://localhost:5000\nBETTER_AUTH_URL=http://localhost:3000\nBETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}\nMONGODB_URI=${uri}\nMONGODB_DB=pataghor\nJWT_AUDIENCE=pataghor-api\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\nIMGBB_API_KEY=\n`);
console.log("Local MongoDB is ready on port 27018. Keep this terminal running. Start the API and client in separate terminals.");
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await database.stop({ doCleanup: false, force: false }); process.exit(0); });
