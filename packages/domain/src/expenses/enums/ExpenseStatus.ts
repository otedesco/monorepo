export type ExpenseStatus = "submitted" | "approved" | "rejected";

export const ExpenseStatus = {
  SUBMITTED: "submitted" as const,
  APPROVED: "approved" as const,
  REJECTED: "rejected" as const,
} as const;

