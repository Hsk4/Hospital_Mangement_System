import { collection } from "@/lib/db";
import { HttpError } from "@/lib/api";
import type { Patient } from "@/features/patients/schema";
import { WARDS, type Bed, type Ward } from "./schema";

const SIZES: Record<Ward, number> = { ICU: 4, General: 8, Maternity: 4, Pediatrics: 4 };
const seed: Bed[] = WARDS.flatMap((ward) =>
  Array.from({ length: SIZES[ward] }, (_, i) => ({ id: `${ward.toLowerCase()}-${i + 1}`, ward, number: i + 1, status: "available" as const })),
);
export const beds = collection<Bed>("beds", seed);

export function occupancy() {
  return WARDS.map((ward) => {
    const all = beds.all().filter((b) => b.ward === ward);
    const occupied = all.filter((b) => b.status === "occupied").length;
    return { ward, total: all.length, occupied, pct: all.length ? Math.round((occupied / all.length) * 100) : 0 };
  });
}

/** Ward restrictions shared by admit + transfer. */
export function assertWardAllows(ward: Ward, p: Patient) {
  if (ward === "Maternity" && p.gender !== "female") throw new HttpError(422, "Maternity ward is for female patients only");
  if (ward === "Pediatrics" && p.age > 14) throw new HttpError(422, "Pediatrics ward is for patients aged 14 or under");
}
