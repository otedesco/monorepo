import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, queryKeys } from "@api-client";
import type { Expense } from "@domain";

export interface CreateExpenseInput {
  tenantId: string;
  propertyId: string;
  amount: number;
  currency?: string;
  category: Expense["category"];
  description?: string;
}

/**
 * React Query mutation hook for creating expenses
 * Automatically invalidates the expenses list query on success
 */
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      // Invalidate all expense list queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
    },
  });
}

