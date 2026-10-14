import { handle, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prescriptions } from "@/features/billing/repository";

export const GET = handle(async (_r, { params }) => { await requireRole(); return mustGet(prescriptions, (await params).id, "Prescription"); });
export const DELETE = handle(async (_r, { params }) => {
  await requireRole("admin");
  const id = (await params).id;
  mustGet(prescriptions, id, "Prescription");
  prescriptions.delete(id);
  return new Response(null, { status: 204 });
});
