// app/api/team/remove-member/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { teamId, memberId } = await request.json();

        if (!teamId || !memberId) {
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
                { error: 'Not authorized to remove team members' },
                { status: 403 }
            );
        }

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Check if attempting to remove the team owner using admin client
        const { data: memberProfile, error: memberError } = await supabaseAdmin
            .from('users')
            .select('is_team_owner')
            .eq('id', memberId)
            .single();

        if (memberError) {
            console.error('Error fetching member profile:', memberError);
            return NextResponse.json(
                { error: 'Member profile could not be retrieved' },
                { status: 500 }
            );
        }

        if (memberProfile.is_team_owner) {
            return NextResponse.json(
                { error: 'Cannot remove team owner. Transfer ownership first.' },
                { status: 400 }
            );
        }

        // Update the member to remove them from the team
        const { error: removeError } = await supabaseAdmin
            .from("users")
            .update({
                account_type: "single",
                team_id: null,
                is_team_owner: false,
            })
            .eq("id", memberId);

        if (removeError) {
            console.error('Error removing team member:', removeError);
            return NextResponse.json(
                { error: 'Failed to remove team member' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in remove-member API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}