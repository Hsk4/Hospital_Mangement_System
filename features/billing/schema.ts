import { z } from "zod";

export const medicineSchema = z.object({
  medicine: z.string().min(2), dosage: z.string().min(1), frequency: z.string().min(1),
  duration: z.string().min(1), notes: z.string().optional(),
});
export const createPrescriptionSchema = z.object({
  patientId: z.string(), doctorId: z.string(), diagnosis: z.string().min(3), items: z.array(medicineSchema).min(1),
});
export type Prescription = z.infer<typeof createPrescriptionSchema> & { id: string; createdAt: string };

export const lineItemSchema = z.object({ description: z.string().min(2), qty: z.number().int().min(1), unitPrice: z.number().min(0) });
export const createInvoiceSchema = z.object({
  patientId: z.string(), items: z.array(lineItemSchema).min(1),
  taxPct: z.number().min(0).max(100).default(0), discount: z.number().min(0).default(0),
});
export const generateInvoiceSchema = z.object({
  patientId: z.string(), doctorId: z.string(), bedDays: z.number().int().min(0).default(0), bedRate: z.number().min(0).default(5000),
});
export const paySchema = z.object({ method: z.enum(["cash", "card", "online"]) });

export type Invoice = z.infer<typeof createInvoiceSchema> & {
  id: string; subtotal: number; total: number; status: "pending" | "paid" | "overdue";
  dueDate: string; createdAt: string; paymentMethod?: "cash" | "card" | "online"; paidAt?: string;
};
