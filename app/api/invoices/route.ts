import { handle, parseBody, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { invoices, newInvoice, withStatus } from "@/features/billing/repository";
import { createInvoiceSchema } from "@/features/billing/schema";

export const GET = handle(async (req) => {
  await requireRole();
  const p = new URL(req.url).searchParams;
  const [status, patientId] = [p.get("status"), p.get("patientId")];
  return invoices.all().map(withStatus).filter((i) => (!status || i.status === status) && (!patientId || i.patientId === patientId));
});

export const POST = handle(async (req) => {
  await requireRole("admin", "receptionist");
  const d = await parseBody(req, createInvoiceSchema);
  mustGet(patients, d.patientId, "Patient");
  return Response.json(newInvoice(d), { status: 201 });
});
