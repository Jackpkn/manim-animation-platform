import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    GEMINI_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env); 