import { handle, parseBody, mustGet, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { invoices } from "@/features/billing/repository";
import { paySchema } from "@/features/billing/schema";

export const POST = handle(async (req, { params }) => {
  await requireRole("admin", "receptionist");
  const inv = mustGet(invoices, (await params).id, "Invoice");
  if (inv.status === "paid") throw new HttpError(409, "Invoice already paid");
  const { method } = await parseBody(req, paySchema);
  return invoices.update(inv.id, { status: "paid", paymentMethod: method, paidAt: new Date().toISOString() });
});
