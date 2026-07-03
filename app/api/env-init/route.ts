// app/api/env-init/route.ts
import { ensureEnvValidated } from '../../lib/envValidate';

export async function GET() {
  try {
    ensureEnvValidated();
    return new Response('env-init ok');
  } catch (err: unknown) {
    const body = err instanceof Error ? err.message : 'env-init failed';
    return new Response(`env-init failed: ${body}`, { status: 500 });
  }
}
