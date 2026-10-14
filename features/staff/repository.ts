import { collection } from "@/lib/db";
import type { Department, Doctor } from "./schema";

export const departments = collection<Department>("departments", [
  { id: "dep-1", name: "Cardiology", headDoctorId: "d-1" },
  { id: "dep-2", name: "Pediatrics", headDoctorId: "d-2" },
  { id: "dep-3", name: "Emergency" },
]);
export const doctors = collection<Doctor>("doctors", [
  { id: "d-1", name: "Dr. Bilal Khan", specialization: "Cardiologist", departmentId: "dep-1", consultationFee: 3000, availability: [1, 2, 3, 4, 5], status: "active" },
  { id: "d-2", name: "Dr. Sara Iqbal", specialization: "Pediatrician", departmentId: "dep-2", consultationFee: 2500, availability: [1, 3, 5], status: "active" },
]);
