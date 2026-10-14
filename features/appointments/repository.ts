import { collection } from "@/lib/db";
import { HttpError } from "@/lib/api";
import type { Appointment } from "./schema";

export const appointments = collection<Appointment>("appointments");

export const TRANSITIONS: Record<Appointment["status"], Appointment["status"][]> = {
  scheduled: ["checked_in", "cancelled"],
  checked_in: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/** Rejects overlapping bookings for the same doctor (ignores cancelled + the appointment itself). */
export function assertNoConflict(doctorId: string, start: string, end: string, ignoreId?: string) {
  const s = +new Date(start), e = +new Date(end);
  const clash = appointments.all().find(
    (a) => a.doctorId === doctorId && a.id !== ignoreId && a.status !== "cancelled" && s < +new Date(a.end) && e > +new Date(a.start),
  );
  if (clash) throw new HttpError(409, `Doctor already booked from ${clash.start} to ${clash.end}`);
}
