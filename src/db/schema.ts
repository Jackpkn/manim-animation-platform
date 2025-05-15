import { pgTable, serial, text, timestamp, varchar, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    code: text('code').notNull(),
    videoUrl: text('video_url'),
    isPublic: boolean('is_public').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chats table for conversation history
export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    projectId: serial('project_id').references(() => projects.id).notNull(),
    role: varchar('role', { length: 50 }).notNull(), // 'user' or 'assistant'
    content: text('content').notNull(),
    code: text('code'), // Optional code snippets in the chat
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Generated code versions table
export const generatedCode = pgTable('generated_code', {
    id: serial('id').primaryKey(),
    projectId: serial('project_id').references(() => projects.id).notNull(),
    code: text('code').notNull(),
    prompt: text('prompt').notNull(),
    metadata: jsonb('metadata'), // Store additional metadata like execution time, success status, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    user: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
    chats: many(chats),
    generatedCode: many(generatedCode),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
    project: one(projects, {
        fields: [chats.projectId],
        references: [projects.id],
    }),
}));

export const generatedCodeRelations = relations(generatedCode, ({ one }) => ({
    project: one(projects, {
        fields: [generatedCode.projectId],
        references: [projects.id],
    }),
})); 