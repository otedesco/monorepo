import type { Expense } from "@domie/domain";
import { ExpenseStatus } from "@domie/domain";
import { createSupabaseClientFromEnv } from "./supabaseClient.ts";
import { SupabaseExpenseRepository } from "./expenses/SupabaseExpenseRepository.ts";
import { listExpenses } from "@domain/expenses/usecases/ListExpenses";
import { submitExpense } from "@domain/expenses/usecases/SubmitExpense";

export interface FetchExpensesParams {
  tenantId?: string;
  propertyId?: string;
  status?: Expense["status"];
}

/**
 * Fetch expenses from Supabase
 * Uses the domain use case and repository pattern
 */
export async function fetchExpenses(params: FetchExpensesParams): Promise<Expense[]> {
  const supabase = createSupabaseClientFromEnv();
  const repository = new SupabaseExpenseRepository(supabase);

  return listExpenses(params, {
    expenseRepository: repository,
  });
}

export interface CreateExpenseInput {
  tenantId: string;
  propertyId: string;
  amount: number;
  currency?: string;
  category: Expense["category"];
  description?: string;
}

/**
 * Create a new expense
 * Uses the domain use case and repository pattern
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const supabase = createSupabaseClientFromEnv();
  const repository = new SupabaseExpenseRepository(supabase);

  const result = await submitExpense(
    {
      tenantId: input.tenantId,
      propertyId: input.propertyId,
      amount: input.amount,
      currency: input.currency,
      category: input.category,
      description: input.description,
    },
    {
      expenseRepository: repository,
      generateId: () => crypto.randomUUID(),
    }
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.expense;
}

