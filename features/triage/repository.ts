import { collection } from "@/lib/db";
import type { TriageEntry } from "./schema";
export const triage = collection<TriageEntry>("triage");
export const RANK = { critical: 0, medium: 1, low: 2 } as const;
