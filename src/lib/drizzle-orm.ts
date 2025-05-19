import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

// Only create the database connection on the server side
let db: NeonHttpDatabase<typeof schema>;

if (typeof window === 'undefined') {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be a Neon postgres connection string");
  }
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // Create a mock db for client-side
  db = {
    query: {
      projects: {
        findFirst: async () => null,
        findMany: async () => [],
      },
      chats: {
        findMany: async () => [],
      },
    },
    insert: async () => ({ rowsAffected: 0 }),
    update: async () => ({ rowsAffected: 0 }),
  } as unknown as NeonHttpDatabase<typeof schema>;
}

export { db };

// Export types for use in the application
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Project = typeof schema.projects.$inferSelect;
export type NewProject = typeof schema.projects.$inferInsert;
export type Chat = typeof schema.chats.$inferSelect;
export type NewChat = typeof schema.chats.$inferInsert;
export type GeneratedCode = typeof schema.generatedCode.$inferSelect;
export type NewGeneratedCode = typeof schema.generatedCode.$inferInsert;
