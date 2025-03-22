// app/api/team-invite/debug/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This is a debug endpoint to check the actual invitation records in the database
export async function GET(request: NextRequest) {
    try {
        // Use service role client for debugging (has full database access)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Get URL parameters
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        // Get all invites for debugging
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

        // If a specific code was provided, check for it
        let specificInvite = null;
        if (code) {
            specificInvite = allInvites?.find(invite => invite.invite_code === code);
        }

        // Check database schema to see column names
        const { data: schemaInfo, error: schemaError } = await supabase
            .rpc('get_table_definition', { table_name: 'team_invites' });

        // Return debug information
        return NextResponse.json({
            message: "Debug information for team invites",
            requestUrl: request.url,
            searchParams: Object.fromEntries(url.searchParams.entries()),
            codeParameter: code,
            inviteCount: allInvites?.length || 0,
            invites: allInvites,
            specificInvite,
            schemaInfo,
            schemaError: schemaError ? schemaError.message : null,
            currentTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        return NextResponse.json({
            error: 'Error in debug endpoint',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}