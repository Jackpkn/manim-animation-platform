"use client";

import { syncUserWithDatabase } from "@/app/actions/auth";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * This component ensures the user is synced with the database.
 * It should be placed near the top of your app layout or on pages that require authentication.
 */
export default function UserDatabaseSync() {
  const { isSignedIn, isLoaded } = useUser();
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // Only run this effect when the user is signed in and Clerk has fully loaded
    if (isLoaded && isSignedIn && !isSynced) {
      const syncUser = async () => {
        try {
          await syncUserWithDatabase();
          setIsSynced(true);
        } catch (error) {
          console.error("Failed to sync user with database:", error);
        }
      };

      syncUser();
    }
  }, [isSignedIn, isLoaded, isSynced]);

  return null;
}
