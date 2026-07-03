// app/lib/envValidate.ts
import { env, requiredEnvKeys } from './env';

let validated = false;

export function ensureEnvValidated() {
  if (validated) return;

  const missing = requiredEnvKeys.filter((key) => !env[key]);

  if (missing.length) {
    const keys = missing.join(', ');
    throw new Error(`Missing required environment variables: ${keys}`);
  }

  validated = true;
}
