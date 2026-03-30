# Project Rules & Standards

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **State:** Zustand (Global UI), TanStack Query (Server State)
- **Forms:** React Hook Form + Zod validation
- **Database/Auth:** Supabase (@supabase/ssr)

## Coding Guidelines

1. **Components:** Use the `components/ui` directory for primitives. Use `@/components` alias.
2. **State Management:** - Use Server Actions for data mutations.
   - Use TanStack Query for data fetching/caching to handle loading/error states.
   - Use Zustand for simple global state (e.g., opening/closing modals).
3. **Forms:** Always use Zod schemas for validation. Wrap forms in `react-hook-form`.
4. **Supabase:** - Use `@/lib/supabase/server` for Server Components/Actions.
   - Use `@/lib/supabase/client` for Client Components.
5. **Styling:** Use the `cn()` utility for conditional classes. Avoid inline styles.
6. **Naming:** Use PascalCase for components, camelCase for functions/variables.

## Patterns to Avoid

- DO NOT use `useEffect` for data fetching. Use React Query.
- DO NOT use native `fetch`. Use the Supabase client.
- DO NOT use `localStorage` for Auth. Use Supabase cookies/SSR.

## Supabase Best Practices

- Whenever you write a Supabase query, first read `@/types/database.types.ts`. Use the `Database` type to initialize the client: `createClient<Database>(...)`. This ensures all table and column names are 100% accurate.
- Automatic RLS is enabled. After creating any table, you must generate an RLS policy. For example: CREATE POLICY "Allow public read" ON public.posts FOR SELECT USING (true);
- Refresh `database.types.ts` after any schema change: `npx supabase gen types typescript --project-id your-project-id > types/database.types.ts`. This keeps your TypeScript types in sync with your database.