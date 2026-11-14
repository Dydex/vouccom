import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

import { ApiError } from "@/lib/api";

// Errors that won't change on a retry: 4xx except rate limiting.
function isFinal(error: Error) {
  return (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data counts as fresh for 30s; screens opened within that reuse it.
      staleTime: 30_000,
      retry: (failureCount, error) => !isFinal(error) && failureCount < 2,
    },
  },
});

// Refetch stale queries when the app returns to the foreground.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    focusManager.setFocused(state === "active");
  });
}
