import { randomUUID } from "node:crypto";

export type Entity = { id: string };

export class Collection<T extends Entity> {
  private items = new Map<string, T>();
  constructor(seed: T[] = []) {
    seed.forEach((i) => this.items.set(i.id, i));
  }
  all = () => [...this.items.values()];
  get = (id: string) => this.items.get(id);
  create = (data: Omit<T, "id">): T => {
    const item = { ...data, id: randomUUID() } as T;
    this.items.set(item.id, item);
    return item;
  };
  update = (id: string, patch: Partial<Omit<T, "id">>): T | undefined => {
    const cur = this.items.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch } as T;
    this.items.set(id, next);
    return next;
  };
  delete = (id: string) => this.items.delete(id);
}

// Survives dev hot-reloads. Swap this file for Drizzle + Postgres later;
// repositories only depend on the Collection interface.
const g = globalThis as unknown as { __hms?: Map<string, Collection<any>> };
const registry = (g.__hms ??= new Map());

export function collection<T extends Entity>(name: string, seed: T[] = []) {
  if (!registry.has(name)) registry.set(name, new Collection<T>(seed));
  return registry.get(name) as Collection<T>;
}
