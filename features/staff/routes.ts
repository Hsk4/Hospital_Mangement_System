import { crudRoutes } from "@/lib/crud";
import { handle, parseBody, mustGet } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { departments, doctors } from "./repository";
import { createDepartmentSchema, updateDepartmentSchema, createDoctorSchema, updateDoctorSchema, type Department, type Doctor } from "./schema";

export const departmentRoutes = crudRoutes<Department>({
  col: departments, label: "Department", createSchema: createDepartmentSchema, updateSchema: updateDepartmentSchema,
  roles: { write: ["admin"], delete: ["admin"] },
});

const base = crudRoutes<Doctor>({
  col: doctors, label: "Doctor", createSchema: createDoctorSchema, updateSchema: updateDoctorSchema,
  roles: { write: ["admin"], delete: ["admin"] },
});

// Doctors reference a department, so creation validates the foreign key.
export const doctorRoutes = {
  item: base.item,
  collection: {
    GET: base.collection.GET,
    POST: handle(async (req) => {
      await requireRole("admin");
      const data = await parseBody(req, createDoctorSchema);
      mustGet(departments, data.departmentId, "Department");
      return Response.json(doctors.create(data), { status: 201 });
    }),
  },
};
