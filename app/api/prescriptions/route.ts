import { handle, parseBody, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { doctors } from "@/features/staff/repository";
import { prescriptions } from "@/features/billing/repository";
import { createPrescriptionSchema } from "@/features/billing/schema";

export const GET = handle(async (req) => {
  await requireRole();
  const pid = new URL(req.url).searchParams.get("patientId");
  return prescriptions.all().filter((p) => !pid || p.patientId === pid);
});

export const POST = handle(async (req) => {
  await requireRole("doctor", "admin");
  const d = await parseBody(req, createPrescriptionSchema);
  mustGet(patients, d.patientId, "Patient");
  mustGet(doctors, d.doctorId, "Doctor");
  return Response.json(prescriptions.create({ ...d, createdAt: new Date().toISOString() }), { status: 201 });
});
