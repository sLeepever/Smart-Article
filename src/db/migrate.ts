import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: `file:${process.env.DATABASE_URL ?? "./smart-article.db"}`,
});

const db = drizzle(client);

console.log("Running migrations...");
await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations complete.");

client.close();
