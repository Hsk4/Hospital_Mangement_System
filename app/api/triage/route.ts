import { handle, parseBody, mustGet, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { doctors } from "@/features/staff/repository";
import { triage, RANK } from "@/features/triage/repository";
import { addToQueueSchema } from "@/features/triage/schema";

// Critical patients float to the top of Waiting; everything else is oldest-first.
export const GET = handle(async (req) => {
  await requireRole();
  const status = new URL(req.url).searchParams.get("status");
  return triage.all()
    .filter((t) => !status || t.status === status)
    .sort((a, b) => (a.status === "waiting" && b.status === "waiting" ? RANK[a.priority] - RANK[b.priority] : 0)
      || a.createdAt.localeCompare(b.createdAt));
});

export const POST = handle(async (req) => {
  const s = await requireRole("admin", "doctor", "nurse", "receptionist");
  const d = await parseBody(req, addToQueueSchema);
  mustGet(patients, d.patientId, "Patient");
  if (d.doctorId) mustGet(doctors, d.doctorId, "Doctor");
  if (triage.all().some((t) => t.patientId === d.patientId && t.status !== "discharged"))
    throw new HttpError(409, "Patient is already in the ER queue");
  const at = new Date().toISOString();
  return Response.json(
    triage.create({ ...d, status: "waiting", createdAt: at, timeline: [{ at, status: "waiting", by: s.name }] }),
    { status: 201 },
  );
});
