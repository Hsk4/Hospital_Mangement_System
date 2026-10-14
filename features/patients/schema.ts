import { z } from "zod";

export const patientBase = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0).max(120),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Invalid phone number"),
  email: z.email().optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  address: z.string().optional(),
  allergies: z.array(z.string()).default([]),
});
export const createPatientSchema = patientBase;
export const updatePatientSchema = patientBase.partial().extend({
  status: z.enum(["active", "admitted", "discharged"]).optional(),
});
export type Patient = z.infer<typeof patientBase> & {
  id: string; status: "active" | "admitted" | "discharged"; createdAt: string;
};
