import { z } from "zod";

export const createDepartmentSchema = z.object({ name: z.string().min(2), headDoctorId: z.string().optional() });
export const updateDepartmentSchema = createDepartmentSchema.partial();
export type Department = z.infer<typeof createDepartmentSchema> & { id: string };

export const createDoctorSchema = z.object({
  name: z.string().min(2),
  specialization: z.string().min(2),
  departmentId: z.string(),
  consultationFee: z.number().min(0),
  availability: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]), // 0 = Sunday
  status: z.enum(["active", "on_leave"]).default("active"),
});
export const updateDoctorSchema = createDoctorSchema.partial();
export type Doctor = z.infer<typeof createDoctorSchema> & { id: string };
