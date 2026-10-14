import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { HttpError } from "./api";

export const ROLES = ["admin", "doctor", "nurse", "receptionist"] as const;
export type Role = (typeof ROLES)[number];
export type Session = { uid: string; name: string; role: Role; exp: number };

const COOKIE = "hms_session";
const secret = () => process.env.SESSION_SECRET ?? "dev-only-secret-change-me";
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");

export function encodeSession(s: Omit<Session, "exp">, ttlSec = 60 * 60 * 8) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + ttlSec * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token?: string): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  return s.exp > Date.now() ? s : null;
}

export async function setSessionCookie(s: Omit<Session, "exp">) {
  (await cookies()).set(COOKIE, encodeSession(s), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8,
  });
}
export async function clearSessionCookie() { (await cookies()).delete(COOKIE); }
export async function getSession() { return decodeSession((await cookies()).get(COOKIE)?.value); }

/** Call at the top of every handler. No roles given = any signed-in user. */
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Not authenticated");
  if (roles.length && !roles.includes(s.role)) throw new HttpError(403, `Requires role: ${roles.join(" | ")}`);
  return s;
}
