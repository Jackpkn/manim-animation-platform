"use server";

import { users } from "@/db/schema";
import { db } from "@/lib/drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

/**
 * Checks if the current user exists in the database and creates them if not
 * This should be called after a user signs in or signs up
 */
export async function syncUserWithDatabase() {
  // Get the current user from Clerk
  const user = await currentUser();

  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  // Check if user already exists in our database
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // If user doesn't exist, create them
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username || null,
      email: email,
    });

    console.log(`Created new user in database: ${email}`);
    return true;
  }

  return false; // User already existed
}
