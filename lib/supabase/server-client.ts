// lib/supabase/server-client.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { Database } from './database.types';

// Default server-side client for basic operations
export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cached server-side auth check
export const getServerSession = cache(async () => {
    const supabase = createServerComponentClient<Database>({ cookies });
    return await supabase.auth.getSession();
});

// Cached server-side profile fetch
export const getServerProfile = cache(async () => {
    const { data: { session } } = await getServerSession();

    if (!session) return null;

    const supabase = createServerComponentClient<Database>({ cookies });
    const { data } = await supabase
        .from('users')
        .select('*, teams(*)')
        .eq('id', session.user.id)
        .single();

    return data;
});

// Service role client for server-side operations
export const createServiceRoleClient = () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

// Singleton for service role client
let serviceRoleInstance: ReturnType<typeof createServiceRoleClient> | null = null;

export const getServiceRoleClient = () => {
    if (!serviceRoleInstance) {
        serviceRoleInstance = createServiceRoleClient();
    }
    return serviceRoleInstance;
};