// lib/api-auth.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from './supabase/database.types';
import { getServiceClient } from './supabase/utils';

// Map to store authenticated sessions keyed by request ID
// This prevents repeated auth checks within the same request lifecycle
const sessionCache = new Map();

// Helper for API routes to check auth and get user
export async function authenticateApiRequest() {
    try {
        // Use a single client instance per request
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

        // Generate a unique ID for this request
        const requestId = crypto.randomUUID();

        // Check if we have a cached session
        if (!sessionCache.has(requestId)) {
            const sessionData = await supabase.auth.getSession();
            sessionCache.set(requestId, sessionData);

            // Clean up cache after request is likely completed (5 seconds)
            setTimeout(() => {
                sessionCache.delete(requestId);
            }, 5000);
        }

        const { data: { session } } = sessionCache.get(requestId);

        if (!session) {
            return {
                authenticated: false,
                response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
                supabase,
                userId: null
            };
        }

        return {
            authenticated: true,
            // Return an empty NextResponse object instead of null
            response: NextResponse.json({}),
            supabase,
            userId: session.user.id
        };
    } catch (error) {
        console.error('API auth error:', error);
        return {
            authenticated: false,
            response: NextResponse.json({ error: 'Authentication error' }, { status: 500 }),
            supabase: null,
            userId: null
        };
    }
}

export { getServiceClient } from "@/lib/supabase/utils";