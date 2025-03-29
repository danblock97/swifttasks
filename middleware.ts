// middleware.ts (root of your project)
import { NextResponse, NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Simple in-memory token cache with 5-minute TTL
const tokenCache = new Map<string, { session: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Only check auth for protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/api/auth')) {

        try {
            // Clean expired cache entries
            const now = Date.now();
            for (const [key, value] of tokenCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    tokenCache.delete(key);
                }
            }

            // Check for session cookie and try to use our token cache first
            const sessionCookie = request.cookies.get('sb-session-id')?.value;
            const cachedData = sessionCookie ? tokenCache.get(sessionCookie) : null;

            let session = null;

            if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
                // Use cached session data
                session = cachedData.session;
            } else {
                // If not in cache or expired, check with Supabase
                const supabase = createMiddlewareClient({ req: request, res: response });
                const { data } = await supabase.auth.getSession();
                session = data.session;

                // Cache the result if we have a session
                if (session && sessionCookie) {
                    tokenCache.set(sessionCookie, {
                        session,
                        timestamp: now
                    });
                }
            }

            // Redirect to login if not authenticated
            if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Add a header to indicate auth state to API routes
            if (session) {
                response.headers.set('x-user-authenticated', 'true');
                response.headers.set('x-user-id', session.user.id);
            }
        } catch (error) {
            console.error('Middleware auth error:', error);

            // Fail gracefully - don't block the request but send to login for dashboard routes
            if (request.nextUrl.pathname.startsWith('/dashboard')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    return response;
}

// Configure middleware to run on specific routes
export const config = {
    matcher: [
        // Protected routes requiring auth
        '/dashboard/:path*',
        // API routes (except auth-related ones)
        '/api/:path*',
        // Exclude public files and auth endpoints
        '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};