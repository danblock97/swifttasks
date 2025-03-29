// lib/middleware/user-profile.ts
import { NextResponse, NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Only apply to dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        try {
            // Check if session exists
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Check if we already have the profile in the request header
            // This avoids duplicate queries on the same request chain
            if (!request.headers.get('x-user-profile')) {
                // Get user profile with team data - single query that will be reused
                const { data: profile } = await supabase
                    .from('users')
                    .select('*, teams(*)')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    // Store profile in response headers (base64 encoded)
                    response.headers.set(
                        'x-user-profile',
                        Buffer.from(JSON.stringify(profile)).toString('base64')
                    );
                }
            }
        } catch (error) {
            console.error('Error in user profile middleware:', error);
        }
    }

    return response;
}

// Configure middleware to run only on dashboard routes
export const config = {
    matcher: ['/dashboard/:path*'],
};