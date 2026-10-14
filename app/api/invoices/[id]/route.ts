import { handle, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { invoices, withStatus } from "@/features/billing/repository";
export const GET = handle(async (_r, { params }) => { await requireRole(); return withStatus(mustGet(invoices, (await params).id, "Invoice")); });
