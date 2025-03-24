import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';
import { cache } from 'react';

/**
 * Creates a Supabase client for use in server components or API routes.
 * This function is cached to prevent multiple instances during a request.
 * 
 * The server client provides:
 * - Access to database with RLS policies applied based on the user's session
 * - Authentication operations in server contexts
 * 
 * Usage:
 * import { createServerClient } from '@/lib/supabase/server';
 * 
 * // In a Server Component:
 * const supabase = createServerClient();
 * const { data } = await supabase.from('table').select();
 */
export const createServerClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}); 