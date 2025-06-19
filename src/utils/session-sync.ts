// Client-side session sync utility
// This should be called after server-side login to sync the client session

export async function syncClientSession() {
  console.log("[SessionSync] Attempting to sync client session...");

  try {
    // Make a request to our auth callback endpoint to establish client session
    const response = await fetch('/auth/sync-session', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log("[SessionSync] Session sync successful");
      return true;
    } else {
      console.warn("[SessionSync] Session sync failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("[SessionSync] Session sync error:", error);
    return false;
  }
}

// Check if we need to sync session after page load
export function checkAndSyncSession() {
  // Check if we're on a page after redirect from login
  const urlParams = new URLSearchParams(window.location.search);
  const fromLogin = urlParams.get('from') === 'login';

  if (fromLogin) {
    console.log("[SessionSync] Detected login redirect, syncing session...");
    syncClientSession();
  }
}
