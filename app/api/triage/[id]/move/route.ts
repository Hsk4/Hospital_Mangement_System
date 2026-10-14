import { handle, parseBody, mustGet, HttpError } from "@/lib/api";
import { requireRole, type Role } from "@/lib/auth";
import { doctors } from "@/features/staff/repository";
import { triage } from "@/features/triage/repository";
import { moveSchema, type TriageStatus } from "@/features/triage/schema";

// Kanban drop target: who may move a card INTO each column.
const ENTRY_RULES: Partial<Record<TriageStatus, Role[]>> = { treatment: ["doctor", "nurse"], discharged: ["doctor"] };

export const POST = handle(async (req, { params }) => {
  const s = await requireRole("admin", "doctor", "nurse");
  const { status, doctorId } = await parseBody(req, moveSchema);
  const entry = mustGet(triage, (await params).id, "Triage entry");
  const allowed = ENTRY_RULES[status];
  if (allowed && !allowed.includes(s.role)) throw new HttpError(403, `Only ${allowed.join("/")} can move patients to ${status}`);
  if (entry.status === "discharged") throw new HttpError(409, "Patient already discharged");
  if (doctorId) mustGet(doctors, doctorId, "Doctor");
  return triage.update(entry.id, {
    status, doctorId: doctorId ?? entry.doctorId,
    timeline: [...entry.timeline, { at: new Date().toISOString(), status, by: s.name }],
  });
});
