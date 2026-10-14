import { handle } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { beds, occupancy } from "@/features/beds/repository";

export const GET = handle(async () => {
  await requireRole();
  return { beds: beds.all(), occupancy: occupancy() };
});
