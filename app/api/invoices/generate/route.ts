import { handle, parseBody, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { doctors } from "@/features/staff/repository";
import { newInvoice } from "@/features/billing/repository";
import { generateInvoiceSchema } from "@/features/billing/schema";

// Auto-builds an invoice from the doctor's consultation fee + bed days.
export const POST = handle(async (req) => {
  await requireRole("admin", "receptionist");
  const d = await parseBody(req, generateInvoiceSchema);
  mustGet(patients, d.patientId, "Patient");
  const doc = mustGet(doctors, d.doctorId, "Doctor");
  const items = [{ description: `Consultation - ${doc.name}`, qty: 1, unitPrice: doc.consultationFee }];
  if (d.bedDays > 0) items.push({ description: "Bed charges (per day)", qty: d.bedDays, unitPrice: d.bedRate });
  return Response.json(newInvoice({ patientId: d.patientId, items, taxPct: 0, discount: 0 }), { status: 201 });
});
