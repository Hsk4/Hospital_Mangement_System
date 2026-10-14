import { handle, parseBody, mustGet, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { appointments, assertNoConflict, TRANSITIONS } from "@/features/appointments/repository";
import { updateAppointmentSchema } from "@/features/appointments/schema";

export const GET = handle(async (_r, { params }) => {
  await requireRole();
  return mustGet(appointments, (await params).id, "Appointment");
});

// Used for both drag-to-reschedule (start/end) and status changes.
export const PATCH = handle(async (req, { params }) => {
  await requireRole("admin", "receptionist", "doctor");
  const id = (await params).id;
  const cur = mustGet(appointments, id, "Appointment");
  const patch = await parseBody(req, updateAppointmentSchema);

  const start = patch.start ?? cur.start, end = patch.end ?? cur.end;
  if (+new Date(end) <= +new Date(start)) throw new HttpError(400, "end must be after start");
  if (patch.status && patch.status !== cur.status && !TRANSITIONS[cur.status].includes(patch.status))
    throw new HttpError(409, `Cannot change status from ${cur.status} to ${patch.status}`);
  if ((patch.start || patch.end) && ["completed", "cancelled"].includes(cur.status))
    throw new HttpError(409, `Cannot reschedule a ${cur.status} appointment`);
  if (patch.start || patch.end) assertNoConflict(cur.doctorId, start, end, id);

  return appointments.update(id, { ...patch, start, end });
});

export const DELETE = handle(async (_r, { params }) => {
  await requireRole("admin", "receptionist");
  if (!appointments.delete((await params).id)) throw new HttpError(404, "Appointment not found");
  return new Response(null, { status: 204 });
});
