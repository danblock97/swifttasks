// app/api/team/transfer-ownership/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { currentUserId, newOwnerId, teamId } = await request.json();

        if (!currentUserId || !newOwnerId || !teamId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verify that the request is coming from an authenticated team owner
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is a team owner
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('is_team_owner, team_id')
            .eq('id', session.user.id)
            .single();

        if (profileError || !userProfile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            );
        }

        if (!userProfile.is_team_owner || userProfile.team_id !== teamId) {
            return NextResponse.json(
                { error: 'Not authorized to transfer team ownership' },
                { status: 403 }
            );
        }

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Begin a transaction to transfer ownership using the admin client
        // 1. Remove owner status from current owner
        const { error: removeOwnerError } = await supabaseAdmin
            .from("users")
            .update({ is_team_owner: false })
            .eq("id", currentUserId)
            .eq("team_id", teamId);

        if (removeOwnerError) {
            console.error('Error removing owner status:', removeOwnerError);
            return NextResponse.json(
                { error: 'Failed to remove owner status from current owner' },
                { status: 500 }
            );
        }

        // 2. Make selected member the new owner
        const { error: newOwnerError } = await supabaseAdmin
            .from("users")
            .update({ is_team_owner: true })
            .eq("id", newOwnerId)
            .eq("team_id", teamId);

        if (newOwnerError) {
            console.error('Error setting new owner:', newOwnerError);
            // Try to revert the previous change if this fails
            await supabaseAdmin
                .from("users")
                .update({ is_team_owner: true })
                .eq("id", currentUserId)
                .eq("team_id", teamId);

            return NextResponse.json(
                { error: 'Failed to set new team owner' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in transfer-ownership API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}