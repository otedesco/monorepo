import type { Expense } from "../entities/Expense.ts";
import { ExpenseStatus } from "../enums/ExpenseStatus.ts";
import { Money } from "../valueObjects/Money.ts";
import type { ExpenseRepository } from "../repositories/ExpenseRepository.ts";

export interface SubmitExpenseInput {
  tenantId: string;
  propertyId: string;
  amount: number;
  currency?: string;
  category: Expense["category"];
  description?: string;
  submittedAt?: Date;
}

export interface SubmitExpenseDependencies {
  expenseRepository: ExpenseRepository;
  generateId: () => string;
}

export interface SubmitExpenseResult {
  success: true;
  expense: Expense;
}

export interface SubmitExpenseError {
  success: false;
  error: string;
}

export type SubmitExpenseOutput = SubmitExpenseResult | SubmitExpenseError;

export function submitExpense(
  input: SubmitExpenseInput,
  deps: SubmitExpenseDependencies
): Promise<SubmitExpenseOutput> {
  return Promise.resolve().then(() => {
    try {
      // Validate input
      if (!input.tenantId) {
        return {
          success: false,
          error: "Tenant ID is required",
        } as SubmitExpenseError;
      }

      if (!input.propertyId) {
        return {
          success: false,
          error: "Property ID is required",
        } as SubmitExpenseError;
      }

      if (input.amount === undefined || input.amount === null) {
        return {
          success: false,
          error: "Amount is required",
        } as SubmitExpenseError;
      }

      if (input.amount <= 0) {
        return {
          success: false,
          error: "Amount must be greater than 0",
        } as SubmitExpenseError;
      }

      if (!input.category) {
        return {
          success: false,
          error: "Category is required",
        } as SubmitExpenseError;
      }

      const validCategories: Expense["category"][] = [
        "maintenance",
        "repair",
        "utilities",
        "cleaning",
        "improvement",
        "other",
      ];

      if (!validCategories.includes(input.category)) {
        return {
          success: false,
          error: `Category must be one of: ${validCategories.join(", ")}`,
        } as SubmitExpenseError;
      }

      // Create value objects
      let money: Money;
      try {
        money = Money.create(input.amount, input.currency);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Invalid money value",
        } as SubmitExpenseError;
      }

      // Create expense entity
      const expense = Expense.create({
        id: deps.generateId(),
        tenantId: input.tenantId,
        propertyId: input.propertyId,
        amount: money,
        status: ExpenseStatus.SUBMITTED,
        category: input.category,
        description: input.description,
        submittedAt: input.submittedAt || new Date(),
      });

      // Persist via repository
      return deps.expenseRepository.create(expense).then((createdExpense) => {
        return {
          success: true,
          expense: createdExpense,
        } as SubmitExpenseResult;
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as SubmitExpenseError;
    }
  });
}

