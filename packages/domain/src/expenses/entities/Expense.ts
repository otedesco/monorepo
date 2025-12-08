import type { ExpenseStatus } from "../enums/ExpenseStatus.ts";
import { Money } from "../valueObjects/Money.ts";

export type ExpenseCategory =
  | "maintenance"
  | "repair"
  | "utilities"
  | "cleaning"
  | "improvement"
  | "other";

export interface ExpenseProps {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: Money;
  status: ExpenseStatus;
  submittedAt: Date;
  category: ExpenseCategory;
  description?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export class Expense {
  private constructor(private readonly props: ExpenseProps) {}

  static create(props: ExpenseProps): Expense {
    // Validate required fields
    if (!props.id) {
      throw new Error("Expense ID is required");
    }
    if (!props.tenantId) {
      throw new Error("Tenant ID is required");
    }
    if (!props.propertyId) {
      throw new Error("Property ID is required");
    }
    if (!props.amount) {
      throw new Error("Amount is required");
    }
    if (!props.status) {
      throw new Error("Status is required");
    }
    if (!props.submittedAt) {
      throw new Error("Submitted at date is required");
    }
    if (!props.category) {
      throw new Error("Category is required");
    }

    // Validate status transitions
    if (props.status === "approved" && !props.approvedAt) {
      throw new Error("Approved expenses must have an approvedAt date");
    }
    if (props.status === "rejected" && !props.rejectedAt) {
      throw new Error("Rejected expenses must have a rejectedAt date");
    }
    if (props.status === "rejected" && !props.rejectionReason) {
      throw new Error("Rejected expenses must have a rejection reason");
    }

    return new Expense(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get propertyId(): string {
    return this.props.propertyId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get status(): ExpenseStatus {
    return this.props.status;
  }

  get submittedAt(): Date {
    return this.props.submittedAt;
  }

  get category(): ExpenseCategory {
    return this.props.category;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  // Business logic methods
  approve(approvedAt: Date): Expense {
    if (this.props.status !== "submitted") {
      throw new Error("Only submitted expenses can be approved");
    }

    return new Expense({
      ...this.props,
      status: "approved",
      approvedAt,
    });
  }

  reject(rejectedAt: Date, reason: string): Expense {
    if (this.props.status !== "submitted") {
      throw new Error("Only submitted expenses can be rejected");
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error("Rejection reason is required");
    }

    return new Expense({
      ...this.props,
      status: "rejected",
      rejectedAt,
      rejectionReason: reason,
    });
  }

  canBeApproved(): boolean {
    return this.props.status === "submitted";
  }

  canBeRejected(): boolean {
    return this.props.status === "submitted";
  }
}

