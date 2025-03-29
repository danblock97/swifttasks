// lib/supabase/client-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Singleton pattern for client components
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// For client components - reuse the same instance
export const getClientSupabase = () => {
    if (typeof window === 'undefined') {
        throw new Error('getClientSupabase should only be called in client components');
    }

    if (!clientInstance) {
        clientInstance = createClientComponentClient<Database>();
    }
    return clientInstance;
};