import { handle, parseBody, mustGet, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { beds, assertWardAllows } from "@/features/beds/repository";
import { admitSchema, transferSchema } from "@/features/beds/schema";

/** POST /api/beds/:id/{admit|transfer|discharge|clean} */
export const POST = handle(async (req, { params }) => {
  await requireRole("nurse", "admin");
  const { id, action } = await params;
  const bed = mustGet(beds, id, "Bed");

  switch (action) {
    case "admit": {
      const { patientId } = await parseBody(req, admitSchema);
      const p = mustGet(patients, patientId, "Patient");
      if (bed.status !== "available") throw new HttpError(409, `Bed is ${bed.status}`);
      if (beds.all().some((b) => b.patientId === patientId)) throw new HttpError(409, "Patient already has a bed");
      assertWardAllows(bed.ward, p);
      patients.update(p.id, { status: "admitted" });
      return beds.update(id, { status: "occupied", patientId, admittedAt: new Date().toISOString() });
    }
    case "transfer": {
      const { toBedId } = await parseBody(req, transferSchema);
      const target = mustGet(beds, toBedId, "Target bed");
      if (bed.status !== "occupied" || !bed.patientId) throw new HttpError(409, "Source bed has no patient");
      if (target.status !== "available") throw new HttpError(409, `Target bed is ${target.status}`);
      assertWardAllows(target.ward, mustGet(patients, bed.patientId, "Patient"));
      beds.update(target.id, { status: "occupied", patientId: bed.patientId, admittedAt: bed.admittedAt });
      return beds.update(id, { status: "cleaning", patientId: undefined, admittedAt: undefined });
    }
    case "discharge": {
      if (bed.status !== "occupied" || !bed.patientId) throw new HttpError(409, "Bed has no patient");
      patients.update(bed.patientId, { status: "discharged" });
      return beds.update(id, { status: "cleaning", patientId: undefined, admittedAt: undefined });
    }
    case "clean": {
      if (bed.status !== "cleaning") throw new HttpError(409, "Bed is not awaiting cleaning");
      return beds.update(id, { status: "available" });
    }
    default:
      throw new HttpError(404, `Unknown action: ${action}`);
  }
});
