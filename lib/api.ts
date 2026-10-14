import { ZodError, type ZodType } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Ctx = { params: Promise<Record<string, string>> };

export function handle(fn: (req: Request, ctx: Ctx) => Promise<unknown>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      const out = await fn(req, ctx);
      return out instanceof Response ? out : Response.json(out);
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) return Response.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
      if (e instanceof SyntaxError) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      console.error(e);
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  };
}

export const parseBody = async <T>(req: Request, schema: ZodType<T>) => schema.parse(await req.json());
export const notFound = (what = "Resource") => new HttpError(404, `${what} not found`);

/** Fetch a referenced record or throw 404 (use for foreign-key checks). */
export function mustGet<T>(col: { get: (id: string) => T | undefined }, id: string, label: string): T {
  const item = col.get(id);
  if (!item) throw notFound(label);
  return item;
}
