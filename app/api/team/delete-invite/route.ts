// app/api/team/delete-invite/route.ts
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { inviteCode } = await request.json();

        if (!inviteCode) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        // First check authentication
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Create a service role client to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // First, get the invite to verify it exists
        const { data: invite, error: fetchError } = await supabaseAdmin
            .from('team_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching invitation:', fetchError);
            return NextResponse.json(
                { error: 'Error fetching invitation details' },
                { status: 500 }
            );
        }

        if (!invite) {
            // Invite might have been already deleted, so we'll count this as success
            return NextResponse.json({
                success: true,
                message: 'Invitation not found or already deleted'
            });
        }

        // Sanity check - make sure the current user is tied to this invitation
        const { data: userProfile } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', session.user.id)
            .single();

        // Allow the deletion if the user is the target of the invitation or
        // if they are on the team that sent the invitation
        const isInvitationTarget = userProfile?.email?.toLowerCase() === invite.email.toLowerCase();

        if (!isInvitationTarget) {
            // Check if user is on the team
            const { data: teamUser } = await supabaseAdmin
                .from('users')
                .select('team_id')
                .eq('id', session.user.id)
                .eq('team_id', invite.team_id)
                .single();

            if (!teamUser) {
                return NextResponse.json(
                    { error: 'Not authorized to delete this invitation' },
                    { status: 403 }
                );
            }
        }

        // Delete the invitation
        const { error: deleteError } = await supabaseAdmin
            .from('team_invites')
            .delete()
            .eq('invite_code', inviteCode);

        if (deleteError) {
            console.error('Error deleting invitation:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete invitation' },
                { status: 500 }
            );
        }

        // Also delete any associated notification if it belongs to this user
        if (isInvitationTarget) {
            const { error: notificationDeleteError } = await supabaseAdmin
                .from('user_notifications')
                .delete()
                .eq('user_id', session.user.id)
                .eq('type', 'team_invitation')
                .like('data->invite_code', inviteCode);

            if (notificationDeleteError) {
                console.warn('Error cleaning up notifications:', notificationDeleteError);
                // Non-fatal, continue
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Invitation deleted successfully'
        });
    } catch (error: any) {
        console.error('Error in delete-invite API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}