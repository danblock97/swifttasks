// app/api/team-invite/[code]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const inviteCode = params.code;

        if (!inviteCode) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Check if the invitation exists and is valid
        const { data: invite, error: inviteError } = await supabase
            .from('team_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            // Invitation not found or expired
            return NextResponse.redirect(new URL('/invite-error?error=invalid', request.url));
        }

        // Get the team information
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', invite.team_id)
            .single();

        if (teamError || !team) {
            // Team not found
            return NextResponse.redirect(new URL('/invite-error?error=team-not-found', request.url));
        }

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // User is already logged in
            // Check if their email matches the invitation
            if (session.user.email?.toLowerCase() === invite.email.toLowerCase()) {
                // Update user to join the team
                await supabase
                    .from('users')
                    .update({
                        account_type: 'team_member',
                        team_id: invite.team_id,
                        is_team_owner: false,
                    })
                    .eq('id', session.user.id);

                // Delete the invitation
                await supabase
                    .from('team_invites')
                    .delete()
                    .eq('id', invite.id);

                // Redirect to team dashboard
                return NextResponse.redirect(new URL('/dashboard/team?joined=true', request.url));
            } else {
                // User is logged in with a different email than the invitation
                return NextResponse.redirect(
                    new URL(`/invite-error?error=email-mismatch&inviteEmail=${invite.email}`, request.url)
                );
            }
        } else {
            // User is not logged in, redirect to signup page with pre-filled email
            // And store the invite code in URL parameters
            return NextResponse.redirect(
                new URL(`/register?email=${encodeURIComponent(invite.email)}&invite=${inviteCode}`, request.url)
            );
        }
    } catch (error) {
        console.error('Error processing invite:', error);
        return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
    }
}