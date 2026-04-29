import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

// Lock en memoria que serializa operaciones de auth sin usar navigator.locks
const pendingLocks = new Map<string, Promise<unknown>>();

function memoryLock<R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> {
  const prev = (pendingLocks.get(_name) as Promise<unknown>) ?? Promise.resolve();
  const next = prev.then(() => fn());
  pendingLocks.set(_name, next.catch(() => {}));
  return next;
}

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      isSingleton: false,
      auth: { lock: memoryLock },
    }
  );

  return client;
}
