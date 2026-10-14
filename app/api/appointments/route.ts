import { handle, parseBody, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { doctors } from "@/features/staff/repository";
import { appointments, assertNoConflict } from "@/features/appointments/repository";
import { createAppointmentSchema } from "@/features/appointments/schema";

export const GET = handle(async (req) => {
  await requireRole();
  const p = new URL(req.url).searchParams;
  const [doctorId, patientId, from, to] = ["doctorId", "patientId", "from", "to"].map((k) => p.get(k));
  return appointments.all()
    .filter((a) => (!doctorId || a.doctorId === doctorId) && (!patientId || a.patientId === patientId)
      && (!from || a.start >= from) && (!to || a.start <= to))
    .sort((a, b) => a.start.localeCompare(b.start));
});

export const POST = handle(async (req) => {
  await requireRole("admin", "receptionist", "doctor");
  const d = await parseBody(req, createAppointmentSchema);
  mustGet(patients, d.patientId, "Patient");
  mustGet(doctors, d.doctorId, "Doctor");
  assertNoConflict(d.doctorId, d.start, d.end);
  return Response.json(appointments.create({ ...d, status: "scheduled" }), { status: 201 });
});
