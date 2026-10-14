import type { Role } from "@/lib/auth";

// Demo users. Replace with a hashed-password table when moving to a real DB.
export const USERS: { id: string; name: string; role: Role }[] = [
  { id: "u-admin", name: "Admin Ayesha", role: "admin" },
  { id: "u-doctor", name: "Dr. Bilal Khan", role: "doctor" },
  { id: "u-nurse", name: "Nurse Sana", role: "nurse" },
  { id: "u-reception", name: "Reception Hamza", role: "receptionist" },
];
