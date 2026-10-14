import { z } from "zod";
export const WARDS = ["ICU", "General", "Maternity", "Pediatrics"] as const;
export type Ward = (typeof WARDS)[number];
export type Bed = {
  id: string; ward: Ward; number: number;
  status: "available" | "occupied" | "cleaning" | "maintenance";
  patientId?: string; admittedAt?: string;
};
export const admitSchema = z.object({ patientId: z.string() });
export const transferSchema = z.object({ toBedId: z.string() });
