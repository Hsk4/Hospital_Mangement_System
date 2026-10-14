import type { ZodType } from "zod";
import { handle, parseBody, notFound } from "./api";
import { requireRole, type Role } from "./auth";
import type { Collection, Entity } from "./db";

type Opts<T extends Entity> = {
  col: Collection<T>;
  label: string;
  createSchema: ZodType<any>;
  updateSchema: ZodType<any>;
  /** server-side defaults added on create (e.g. createdAt) */
  defaults?: () => Partial<T>;
  roles: { read?: Role[]; write: Role[]; delete: Role[] };
};

/** Generates validated, role-guarded REST handlers for a collection. */
export function crudRoutes<T extends Entity>(o: Opts<T>) {
  return {
    collection: {
      GET: handle(async (req) => {
        await requireRole(...(o.roles.read ?? []));
        const q = new URL(req.url).searchParams.get("q")?.toLowerCase();
        const all = o.col.all();
        return q ? all.filter((i) => JSON.stringify(i).toLowerCase().includes(q)) : all;
      }),
      POST: handle(async (req) => {
        await requireRole(...o.roles.write);
        const data = await parseBody(req, o.createSchema);
        return Response.json(o.col.create({ ...o.defaults?.(), ...data }), { status: 201 });
      }),
    },
    item: {
      GET: handle(async (_r, { params }) => {
        await requireRole(...(o.roles.read ?? []));
        const item = o.col.get((await params).id);
        if (!item) throw notFound(o.label);
        return item;
      }),
      PATCH: handle(async (req, { params }) => {
        await requireRole(...o.roles.write);
        const patch = await parseBody(req, o.updateSchema);
        const item = o.col.update((await params).id, patch);
        if (!item) throw notFound(o.label);
        return item;
      }),
      DELETE: handle(async (_r, { params }) => {
        await requireRole(...o.roles.delete);
        if (!o.col.delete((await params).id)) throw notFound(o.label);
        return new Response(null, { status: 204 });
      }),
    },
  };
}
