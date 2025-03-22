// app/api/team-invite/accept/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This is an alternate route that can be used with the code as a query parameter
export async function GET(request: NextRequest) {
    try {
        console.log(`[Team Invite Accept] Processing URL: ${request.url}`);

        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        console.log(`[Team Invite Accept] Found code in query: ${code}`);

        if (!code) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        // Redirect to the original handler with the code in the path
        return NextResponse.redirect(new URL(`/api/team-invite/${code}`, request.url));
    } catch (error) {
        console.error('Error in accept endpoint:', error);
        return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
    }
}