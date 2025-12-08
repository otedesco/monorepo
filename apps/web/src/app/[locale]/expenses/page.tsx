"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "@i18n";
import { Button } from "@domie/ui";
import { useExpensesQuery } from "../../../features/expenses/hooks/useExpensesQuery";
import { useCreateExpenseMutation } from "../../../features/expenses/hooks/useCreateExpenseMutation";
import type { Expense } from "@domain";

export default function ExpensesPage() {
  const t = useTranslations("common");
  const locale = useLocale();

  // For demo purposes, using a hardcoded tenantId
  // In a real app, this would come from auth context
  const tenantId = "demo-tenant-id";

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    category: "other" as Expense["category"],
    amount: "",
  });

  const {
    data: expenses,
    isLoading,
    error,
  } = useExpensesQuery({
    tenantId,
    enabled: true,
  });

  const createMutation = useCreateExpenseMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        tenantId,
        propertyId: "demo-property-id", // In real app, this would come from context or selection
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
      });

      // Reset form and close
      setFormData({ description: "", category: "other", amount: "" });
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled by React Query
      console.error("Failed to create expense:", error);
    }
  };

  return (
    <main className="min-h-screen bg-surface text-surface-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">{t("expenses.title")}</h1>
          <Button variant="default" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? t("expenses.form.cancel") : t("expenses.create")}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-6 border border-border-subtle rounded-xl bg-surface">
            <h2 className="text-2xl font-semibold mb-4">{t("expenses.createTitle")}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("expenses.form.description")}</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("expenses.form.descriptionPlaceholder")}
                  className="w-full px-4 py-2 border border-border-subtle rounded-md bg-surface text-surface-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("expenses.form.category")}</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Expense["category"],
                    })
                  }
                  className="w-full px-4 py-2 border border-border-subtle rounded-md bg-surface text-surface-foreground"
                  required
                >
                  <option value="maintenance">{t("expenses.category.maintenance")}</option>
                  <option value="repair">{t("expenses.category.repair")}</option>
                  <option value="utilities">{t("expenses.category.utilities")}</option>
                  <option value="cleaning">{t("expenses.category.cleaning")}</option>
                  <option value="improvement">{t("expenses.category.improvement")}</option>
                  <option value="other">{t("expenses.category.other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("expenses.form.amount")}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder={t("expenses.form.amountPlaceholder")}
                  className="w-full px-4 py-2 border border-border-subtle rounded-md bg-surface text-surface-foreground"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="default" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("expenses.form.creating") : t("expenses.form.submit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ description: "", category: "other", amount: "" });
                  }}
                >
                  {t("expenses.form.cancel")}
                </Button>
              </div>

              {createMutation.isError && (
                <p className="text-red-500 text-sm">
                  {createMutation.error instanceof Error ? createMutation.error.message : t("expenses.error")}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-lg">{t("expenses.loading")}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 border border-red-500 rounded-xl bg-red-50 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              {t("expenses.error")}: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )}

        {/* Expenses List */}
        {!isLoading && !error && expenses && (
          <>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg">{t("expenses.empty")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border-subtle">
                  <thead>
                    <tr className="bg-surface border-b border-border-subtle">
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.id")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.description")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.category")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.amount")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.status")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("expenses.table.submittedAt")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-border-subtle hover:bg-surface/50">
                        <td className="px-4 py-3 text-sm">{expense.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3">{expense.description || "-"}</td>
                        <td className="px-4 py-3">{t(`expenses.category.${expense.category}`)}</td>
                        <td className="px-4 py-3">
                          {new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: expense.amount.currency,
                          }).format(expense.amount.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              expense.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : expense.status === "rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {t(`expenses.status.${expense.status}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Intl.DateTimeFormat(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(expense.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
