import type { Expense } from "../entities/Expense.ts";

export interface ExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  listByPropertyId(propertyId: string): Promise<Expense[]>;
  listByTenantId(tenantId: string): Promise<Expense[]>;
  update(expense: Expense): Promise<Expense>;
}

