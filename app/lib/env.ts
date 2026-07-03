// app/lib/env.ts
// Explicit dotenv loader for safety (Next.js auto-loads .env, but this covers edge cases)
// biome-ignore lint/suspicious/noProcessEnv: intentional env access
if (typeof process !== 'undefined' && process.env && !process.env.DOTENV_LOADED) {
  try {
    // biome-ignore lint/security/noRequireImports: dotenv is safe here
    require('dotenv').config({ path: ['.env', '../.env', '../../.env'] });
    (process.env as Record<string, string | undefined>).DOTENV_LOADED = '1';
  } catch {
    // dotenv not installed or .env absent; Next.js will still load env in dev/build
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

export const requiredEnvKeys = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
] as const;

// Warn only in development, fail fast only in production
const missing = requiredEnvKeys.filter((key) => !env[key]);
if (missing.length) {
  const keys = missing.join(', ');
  throw new Error(`[ENV] Missing required environment variables: ${keys}`);
}

