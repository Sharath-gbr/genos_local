import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/supabase/types';

/**
 * Creates a Supabase client for use in the browser.
 * This client is used for authentication and database operations from frontend components.
 * 
 * It automatically handles:
 * - Authentication state
 * - Token refresh
 * - Session management
 * 
 * Usage: 
 * import { createClient } from '@/lib/supabase/client';
 * const supabase = createClient();
 */
export const createClient = () => {
  return createClientComponentClient<Database>();
}; 