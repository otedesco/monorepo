import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, ExpenseRepository } from "@domie/domain";
import { mapRowToExpense, mapExpenseToRow, type ExpenseRow } from "./ExpenseMapper";

export class SupabaseExpenseRepository implements ExpenseRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(expense: Expense): Promise<Expense> {
    // Get the property to verify tenant_id and get a user for submitted_by
    const { data: property, error: propertyError } = await this.supabase
      .from("properties")
      .select("tenant_id")
      .eq("id", expense.propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error(`Property not found: ${propertyError?.message}`);
    }

    // Verify tenant_id matches
    if (property.tenant_id !== expense.tenantId) {
      throw new Error("Expense tenant_id does not match property tenant_id");
    }

    // Get a user from this tenant to use as submitted_by
    // In practice, you'd pass the actual user.id from the authenticated user
    const { data: user, error: userError } = await this.supabase
      .from("users")
      .select("id")
      .eq("tenant_id", expense.tenantId)
      .limit(1)
      .single();

    if (userError || !user) {
      throw new Error(`Failed to find user for tenant ${expense.tenantId}: ${userError?.message}`);
    }

    const rowInput = mapExpenseToRow(expense);

    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        ...rowInput,
        submitted_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create expense: No data returned");
    }

    return mapRowToExpense(data as ExpenseRow, expense.tenantId);
  }

  async findById(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select(
        `
        *,
        properties!inner(tenant_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to find expense: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Extract tenant_id from the joined property
    const tenantId = (data as any).properties?.tenant_id;
    if (!tenantId) {
      throw new Error("Expense found but tenant_id could not be determined");
    }

    return mapRowToExpense(data as ExpenseRow, tenantId);
  }

  async listByPropertyId(propertyId: string): Promise<Expense[]> {
    // First, get the property to get tenant_id
    const { data: property, error: propertyError } = await this.supabase
      .from("properties")
      .select("tenant_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error(`Property not found: ${propertyError?.message}`);
    }

    const tenantId = property.tenant_id;
    if (!tenantId) {
      throw new Error("Property has no tenant_id");
    }

    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("property_id", propertyId)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list expenses: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => mapRowToExpense(row as ExpenseRow, tenantId));
  }

  async listByTenantId(tenantId: string): Promise<Expense[]> {
    // Get all properties for this tenant, then get expenses for those properties
    const { data: properties, error: propertiesError } = await this.supabase
      .from("properties")
      .select("id")
      .eq("tenant_id", tenantId);

    if (propertiesError) {
      throw new Error(`Failed to find properties: ${propertiesError.message}`);
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map((p) => p.id);

    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .in("property_id", propertyIds)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list expenses: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => mapRowToExpense(row as ExpenseRow, tenantId));
  }

  async update(expense: Expense): Promise<Expense> {
    const rowInput = mapExpenseToRow(expense);

    // Get user ID for approved_by/rejected_by if needed
    let approvedBy: string | null = null;
    let rejectedBy: string | null = null;

    if (expense.approvedAt) {
      // Would need to get the approver's user.id - simplified for now
      const { data: user } = await this.supabase
        .from("users")
        .select("id")
        .eq("tenant_id", expense.tenantId)
        .eq("role", "admin")
        .limit(1)
        .single();
      approvedBy = user?.id || null;
    }

    if (expense.rejectedAt) {
      const { data: user } = await this.supabase
        .from("users")
        .select("id")
        .eq("tenant_id", expense.tenantId)
        .eq("role", "admin")
        .limit(1)
        .single();
      rejectedBy = user?.id || null;
    }

    const { data, error } = await this.supabase
      .from("expenses")
      .update({
        ...rowInput,
        approved_by: approvedBy,
        rejected_by: rejectedBy,
      })
      .eq("id", expense.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to update expense: No data returned");
    }

    return mapRowToExpense(data as ExpenseRow, expense.tenantId);
  }
}
