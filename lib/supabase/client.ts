import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// For client components
export const createClient = () => {
    return createClientComponentClient<Database>();
};

// For server components and API routes
export const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);