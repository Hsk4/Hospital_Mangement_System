import { collection } from "@/lib/db";
import type { Patient } from "./schema";

const now = new Date().toISOString();
const seed: Patient[] = [
  { id: "p-1", name: "Ali Raza", age: 45, gender: "male", phone: "03001234567", bloodGroup: "B+", allergies: ["penicillin"], status: "active", createdAt: now },
  { id: "p-2", name: "Fatima Noor", age: 29, gender: "female", phone: "03111234567", bloodGroup: "O+", allergies: [], status: "active", createdAt: now },
  { id: "p-3", name: "Hassan Ahmed", age: 6, gender: "male", phone: "03211234567", allergies: [], status: "active", createdAt: now },
  { id: "p-4", name: "Zainab Malik", age: 62, gender: "female", phone: "03331234567", bloodGroup: "A-", allergies: ["dust"], status: "active", createdAt: now },
  { id: "p-5", name: "Omar Siddiqui", age: 34, gender: "male", phone: "03451234567", allergies: [], status: "active", createdAt: now },
];
export const patients = collection<Patient>("patients", seed);
