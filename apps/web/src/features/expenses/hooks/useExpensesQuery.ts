import { useQuery } from "@tanstack/react-query";
import { fetchExpenses, queryKeys } from "@api-client";
import type { Expense } from "@domain";

export interface UseExpensesQueryParams {
  tenantId?: string;
  propertyId?: string;
  status?: Expense["status"];
  enabled?: boolean;
}

/**
 * React Query hook for fetching expenses
 */
export function useExpensesQuery(params: UseExpensesQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.expenses.list({
      tenantId: params.tenantId,
      propertyId: params.propertyId,
      status: params.status,
    }),
    queryFn: () => fetchExpenses(params),
    enabled: params.enabled !== false,
  });
}

