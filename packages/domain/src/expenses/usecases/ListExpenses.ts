import type { Expense } from "../entities/Expense.ts";
import type { ExpenseRepository } from "../repositories/ExpenseRepository.ts";

export interface ListExpensesInput {
  tenantId?: string;
  propertyId?: string;
  status?: Expense["status"];
}

export interface ListExpensesDependencies {
  expenseRepository: ExpenseRepository;
}

export async function listExpenses(
  input: ListExpensesInput,
  deps: ListExpensesDependencies
): Promise<Expense[]> {
  let expenses: Expense[];

  // If propertyId is provided, list by property
  if (input.propertyId) {
    expenses = await deps.expenseRepository.listByPropertyId(input.propertyId);
  } else if (input.tenantId) {
    // If tenantId is provided, list by tenant
    expenses = await deps.expenseRepository.listByTenantId(input.tenantId);
  } else {
    // If neither is provided, throw error (at least one filter is required)
    throw new Error("Either tenantId or propertyId must be provided");
  }

  // Filter by status if provided
  if (input.status) {
    expenses = expenses.filter((expense) => expense.status === input.status);
  }

  return expenses;
}

