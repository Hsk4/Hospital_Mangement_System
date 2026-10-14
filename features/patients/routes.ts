import { crudRoutes } from "@/lib/crud";
import { patients } from "./repository";
import { createPatientSchema, updatePatientSchema, type Patient } from "./schema";

export const patientRoutes = crudRoutes<Patient>({
  col: patients, label: "Patient",
  createSchema: createPatientSchema, updateSchema: updatePatientSchema,
  defaults: () => ({ status: "active", createdAt: new Date().toISOString() }),
  roles: { write: ["admin", "receptionist"], delete: ["admin"] },
});
