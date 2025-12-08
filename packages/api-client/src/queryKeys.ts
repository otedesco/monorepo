/**
 * Centralized query keys for React Query
 * Provides type-safe query key factories for all API endpoints
 */

export const queryKeys = {
  expenses: {
    all: ["expenses"] as const,
    lists: () => [...queryKeys.expenses.all, "list"] as const,
    list: (filters?: { tenantId?: string; propertyId?: string; status?: string }) =>
      [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
  },
} as const;

