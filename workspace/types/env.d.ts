declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase Public
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      // Supabase Private (Server-only)
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Node Environment
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// If this file has no import/export statements,
// we must add this to turn it into a module.
export {};
