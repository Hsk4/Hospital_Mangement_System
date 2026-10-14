import { handle } from "@/lib/api";
import { requireRole } from "@/lib/auth";
export const GET = handle(async () => requireRole());
