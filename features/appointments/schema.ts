import { z } from "zod";

const dt = z.iso.datetime({ offset: true });
export const STATUSES = ["scheduled", "checked_in", "completed", "cancelled"] as const;

export const createAppointmentSchema = z
  .object({ patientId: z.string(), doctorId: z.string(), start: dt, end: dt, reason: z.string().min(3) })
  .refine((d) => +new Date(d.end) > +new Date(d.start), { message: "end must be after start", path: ["end"] });

export const updateAppointmentSchema = z.object({
  start: dt.optional(), end: dt.optional(), reason: z.string().min(3).optional(), status: z.enum(STATUSES).optional(),
});

export type Appointment = {
  id: string; patientId: string; doctorId: string; start: string; end: string; reason: string;
  status: (typeof STATUSES)[number];
};
