import { z } from "zod";

export const STATUSES = ["waiting", "triage", "treatment", "observation", "discharged"] as const;
export const PRIORITIES = ["low", "medium", "critical"] as const;
export type TriageStatus = (typeof STATUSES)[number];

export const addToQueueSchema = z.object({
  patientId: z.string(), complaint: z.string().min(3), priority: z.enum(PRIORITIES), doctorId: z.string().optional(),
});
export const moveSchema = z.object({ status: z.enum(STATUSES), doctorId: z.string().optional() });

export type TriageEntry = {
  id: string; patientId: string; complaint: string; priority: (typeof PRIORITIES)[number];
  status: TriageStatus; doctorId?: string; createdAt: string;
  timeline: { at: string; status: TriageStatus; by: string }[];
};
