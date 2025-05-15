// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import * as schema from '../db/schema';

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Export types for use in the application
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Project = typeof schema.projects.$inferSelect;
export type NewProject = typeof schema.projects.$inferInsert;
export type Chat = typeof schema.chats.$inferSelect;
export type NewChat = typeof schema.chats.$inferInsert;
export type GeneratedCode = typeof schema.generatedCode.$inferSelect;
export type NewGeneratedCode = typeof schema.generatedCode.$inferInsert;
