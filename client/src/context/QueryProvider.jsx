/* ═══════════════════════════════════════════════════
   QueryProvider — React Query Configuration
   ═══════════════════════════════════════════════════ */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Refetch when window regains focus (great for tabs)
            refetchOnWindowFocus: true,
            // Retry failed queries once
            retry: 1,
            // Data is fresh for 2 minutes by default
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
        },
        mutations: {
            retry: 0,
        },
    },
})

export function QueryProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export { queryClient }
