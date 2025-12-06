import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/router-types";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log("[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:", process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const url = window.location.origin;
    console.log("[tRPC] Using window.location.origin:", url);
    console.log("[tRPC] Full endpoint URL:", `${url}/api/trpc`);
    return url;
  }

  console.log("[tRPC] Using default localhost");
  return "http://localhost:8081";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          "content-type": "application/json",
        };
      },
      fetch: async (url, options) => {
        const maxRetries = 3;
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            if (attempt > 0) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              console.log(`[tRPC] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            console.log("[tRPC] Making request to:", url);
            console.log("[tRPC] Request method:", options?.method || "GET");
            
            const response = await fetch(url, {
              ...options,
              credentials: 'omit',
            });
            console.log("[tRPC] Response status:", response.status);
            
            if (!response.ok) {
              const text = await response.text();
              console.error("[tRPC] Error response:", response.status, text.substring(0, 500));
              
              if (response.status === 429) {
                console.error("[tRPC] Rate limit hit. Retrying...");
                lastError = new Error(`HTTP 429: Rate limit exceeded`);
                continue;
              }
              
              if (response.status === 404) {
                console.error("[tRPC] Backend endpoint not found.");
                console.error("[tRPC] Expected URL:", url);
                console.error("[tRPC] Base URL:", getBaseUrl());
                console.error("[tRPC] This may mean the backend is still starting up or not deployed yet.");
                console.error("[tRPC] If the problem persists, check:");
                console.error("[tRPC]   1. Backend is running (check console for backend startup logs)");
                console.error("[tRPC]   2. Backend routes are properly registered");
                console.error("[tRPC]   3. Network connectivity");
                if (attempt < maxRetries) {
                  lastError = new Error(`HTTP 404: Backend not ready yet. Waiting for backend to start...`);
                  continue;
                }
              }
              
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
          } catch (error) {
            console.error("[tRPC] Request failed:", error);
            lastError = error as Error;
            
            if (attempt === maxRetries) {
              throw lastError;
            }
          }
        }
        
        throw lastError || new Error("Request failed");
      },
    }),
  ],
});

if (typeof window !== "undefined") {
  const checkBackendHealth = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await fetch(`${getBaseUrl()}/api`);
      const data = await res.json();
      console.log("[tRPC] Backend health check:", data);
    } catch (err) {
      console.warn("[tRPC] Backend not responding yet (this is normal during startup):", err);
    }
  };
  checkBackendHealth();
}
