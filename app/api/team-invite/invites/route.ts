// app/api/team-invite/invites/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This is a simpler debug endpoint that only queries the team_invites table
export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Get URL parameters
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        // Get all invites for debugging - no joins to other tables
        const { data: allInvites, error: invitesError } = await supabase
            .from('team_invites')
            .select('*')
            .order('created_at', { ascending: false });

        if (invitesError) {
            return NextResponse.json({
                error: 'Failed to fetch invites',
                details: invitesError
            }, { status: 500 });
        }

        // Return basic debug information
        return NextResponse.json({
            message: "Current team invites",
            inviteCount: allInvites?.length || 0,
            invites: allInvites,
            currentTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in simple debug endpoint:', error);
        return NextResponse.json({
            error: 'Error in debug endpoint',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}