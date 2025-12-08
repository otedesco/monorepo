import type { Expense, ExpenseCategory } from "@domie/domain";
import { Expense as ExpenseEntity } from "@domie/domain";
import { Money } from "@domie/domain";
import type { ExpenseStatus } from "@domie/domain";

// Database row type (matches Supabase expenses table schema)
export interface ExpenseRow {
  id: string;
  property_id: string;
  submitted_by: string; // This is the user.id, not tenant_id
  category: string;
  description: string;
  amount: string | number; // NUMERIC from DB comes as string
  status: string;
  submitted_at: string; // ISO timestamp string
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Note: tenant_id is not in the expenses table directly
  // We'll need to get it from the property or user relationship
}

// Helper type for creating expenses (without tenant_id, which we'll derive)
export interface ExpenseRowInput {
  property_id: string;
  submitted_by: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  submitted_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
}

/**
 * Maps a database row to a domain Expense entity
 * Note: tenant_id must be provided separately as it's not in the expenses table
 */
export function mapRowToExpense(row: ExpenseRow, tenantId: string): Expense {
  const amount = typeof row.amount === "string" ? parseFloat(row.amount) : row.amount;
  const money = Money.create(amount, "USD"); // Default to USD, could be extended

  return ExpenseEntity.create({
    id: row.id,
    tenantId,
    propertyId: row.property_id,
    amount: money,
    status: row.status as ExpenseStatus,
    category: row.category as ExpenseCategory,
    description: row.description || undefined,
    submittedAt: new Date(row.submitted_at),
    approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
    rejectedAt: row.rejected_at ? new Date(row.rejected_at) : undefined,
    rejectionReason: row.rejection_reason || undefined,
  });
}

/**
 * Maps a domain Expense entity to a database row input
 * Note: submitted_by, approved_by, and rejected_by should be set separately
 * as they need to be resolved from user relationships
 */
export function mapExpenseToRow(expense: Expense): Omit<ExpenseRowInput, "submitted_by" | "approved_by" | "rejected_by"> {
  return {
    property_id: expense.propertyId,
    category: expense.category,
    description: expense.description || "",
    amount: expense.amount.amount,
    status: expense.status,
    submitted_at: expense.submittedAt.toISOString(),
    approved_at: expense.approvedAt?.toISOString() || null,
    approved_by: null, // Would need to be set separately
    rejected_at: expense.rejectedAt?.toISOString() || null,
    rejected_by: null, // Would need to be set separately
    rejection_reason: expense.rejectionReason || null,
  };
}

