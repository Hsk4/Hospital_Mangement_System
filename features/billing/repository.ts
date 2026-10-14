import { collection } from "@/lib/db";
import type { Invoice, Prescription } from "./schema";

export const prescriptions = collection<Prescription>("prescriptions");
export const invoices = collection<Invoice>("invoices");

const money = (n: number) => Math.round(n * 100) / 100;

/** Totals are always computed server-side; the client never sends subtotal/total. */
export function totals(items: Invoice["items"], taxPct: number, discount: number) {
  const subtotal = money(items.reduce((s, i) => s + i.qty * i.unitPrice, 0));
  return { subtotal, total: Math.max(0, money(subtotal + (subtotal * taxPct) / 100 - discount)) };
}

export function newInvoice(d: { patientId: string; items: Invoice["items"]; taxPct: number; discount: number }) {
  const now = new Date();
  return invoices.create({
    ...d, ...totals(d.items, d.taxPct, d.discount), status: "pending",
    createdAt: now.toISOString(), dueDate: new Date(+now + 14 * 864e5).toISOString(),
  });
}

/** "overdue" is derived at read time so it never goes stale. */
export const withStatus = (i: Invoice): Invoice => (i.status === "pending" && i.dueDate < new Date().toISOString() ? { ...i, status: "overdue" } : i);
