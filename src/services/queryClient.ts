import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Menos ruido en development / internal apps
      retry: 1, // Only 1 retry for queries like setting fetches
      staleTime: 5 * 60 * 1000, // 5 min default stale
    },
    mutations: {
      retry: 0, // Nunca hacer auto-retry en writes of LangGraph
    }
  },
});
