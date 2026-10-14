import { handle } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { patients } from "@/features/patients/repository";
import { appointments } from "@/features/appointments/repository";
import { triage } from "@/features/triage/repository";
import { beds, occupancy } from "@/features/beds/repository";
import { invoices } from "@/features/billing/repository";

export const GET = handle(async () => {
  await requireRole();
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const today = day(new Date()), month = today.slice(0, 7);
  const allBeds = beds.all();
  return {
    totalPatients: patients.all().length,
    appointmentsToday: appointments.all().filter((a) => a.start.startsWith(today) && a.status !== "cancelled").length,
    erQueue: triage.all().filter((t) => t.status !== "discharged").length,
    bedOccupancyPct: Math.round((allBeds.filter((b) => b.status === "occupied").length / allBeds.length) * 100),
    revenueThisMonth: invoices.all().filter((i) => i.status === "paid" && i.paidAt?.startsWith(month)).reduce((s, i) => s + i.total, 0),
    wardOccupancy: occupancy(),
    appointmentsPerDay: Array.from({ length: 7 }, (_, n) => {
      const d = day(new Date(Date.now() + (n - 3) * 864e5));
      return { date: d, count: appointments.all().filter((a) => a.start.startsWith(d) && a.status !== "cancelled").length };
    }),
  };
});
