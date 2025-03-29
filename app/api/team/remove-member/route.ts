// app/api/team/remove-member/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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

        // Check if user is a team owner - using normal client relying on RLS
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

        // Check if attempting to remove the team owner (can't remove yourself as owner)
        if (memberId === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot remove yourself as team owner. Transfer ownership first.' },
                { status: 400 }
            );
        }

        // Verify the member is part of the team
        const { data: memberProfile, error: memberError } = await supabase
            .from('users')
            .select('is_team_owner, team_id')
            .eq('id', memberId)
            .single();

        if (memberError) {
            return NextResponse.json(
                { error: 'Member profile not found' },
                { status: 404 }
            );
        }

        if (memberProfile.team_id !== teamId) {
            return NextResponse.json(
                { error: 'Member is not part of this team' },
                { status: 400 }
            );
        }

        if (memberProfile.is_team_owner) {
            return NextResponse.json(
                { error: 'Cannot remove team owner. Transfer ownership first.' },
                { status: 400 }
            );
        }

        // Update the member profile - this requires proper RLS policy in Supabase
        // RLS Policy would be: (auth.uid() IN (SELECT id FROM users WHERE is_team_owner = true AND team_id = users.team_id))
        const { error: removeError } = await supabase
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