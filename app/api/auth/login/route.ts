import { z } from "zod";
import { handle, parseBody, HttpError } from "@/lib/api";
import { ROLES, setSessionCookie } from "@/lib/auth";
import { USERS } from "@/features/auth/users";

// Demo login: pick a role. Production: verify email + password hash here.
const schema = z.object({ role: z.enum(ROLES) });

export const POST = handle(async (req) => {
  const { role } = await parseBody(req, schema);
  const user = USERS.find((u) => u.role === role);
  if (!user) throw new HttpError(404, "No user for role");
  await setSessionCookie({ uid: user.id, name: user.name, role: user.role });
  return { id: user.id, name: user.name, role: user.role };
});
