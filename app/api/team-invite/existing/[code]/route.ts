// FILE: app/api/team-invite/existing/[code]/route.ts
// NEW FILE to handle existing users accepting team invitations

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        console.log(`[Team Invite Existing] Processing invite URL: ${request.url}`);

        const inviteCode = params.code;
        const url = new URL(request.url);
        const searchParams = Object.fromEntries(url.searchParams.entries());

        console.log(`[Team Invite Existing] Path parameter code: ${inviteCode}`);
        console.log(`[Team Invite Existing] All query parameters:`, searchParams);

        // Check for token in various places Supabase might use
        const queryToken = url.searchParams.get('token') ||
            url.searchParams.get('invite_token') ||
            url.searchParams.get('invite_code') ||
            url.searchParams.get('code');

        // Use the token from the URL if available, or fall back to the path parameter
        const codeToUse = queryToken || inviteCode;

        console.log(`[Team Invite Existing] Final code to use: ${codeToUse}`);

        if (!codeToUse) {
            console.log(`[Team Invite Existing] No invitation code found in request`);
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        // Create two clients:
        // 1. A standard client that respects RLS policies for user session handling
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // 2. An admin client with service role for operations that need to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Try to find the invitation
        console.log(`[Team Invite Existing] Searching for invitation with code: ${codeToUse}`);

        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('team_invites')
            .select('*')
            .eq('invite_code', codeToUse)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            console.log(`[Team Invite Existing] Error or invitation not found:`, inviteError);
            return NextResponse.redirect(new URL('/invite-error?error=invalid', request.url));
        }

        // Get the team information
        const { data: team, error: teamError } = await supabaseAdmin
            .from('teams')
            .select('*')
            .eq('id', invite.team_id)
            .single();

        if (teamError || !team) {
            console.log(`[Team Invite Existing] Team not found:`, teamError);
            return NextResponse.redirect(new URL('/invite-error?error=team-not-found', request.url));
        }

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // User is not logged in, redirect to login with invitation parameters
            return NextResponse.redirect(
                new URL(`/login?invitation=${codeToUse}&email=${encodeURIComponent(invite.email)}`, request.url)
            );
        }

        // User is already logged in
        // Check if their email matches the invitation
        if (session.user.email?.toLowerCase() === invite.email.toLowerCase()) {
            try {
                // Update user to join the team - use admin client for this
                await supabaseAdmin
                    .from('users')
                    .update({
                        account_type: 'team_member',
                        team_id: invite.team_id,
                        is_team_owner: false,
                    })
                    .eq('id', session.user.id);

                // Delete the invitation
                await supabaseAdmin
                    .from('team_invites')
                    .delete()
                    .eq('id', invite.id);

                // Redirect to team dashboard
                return NextResponse.redirect(new URL('/dashboard/team?joined=true', request.url));
            } catch (error) {
                console.error('Error updating user profile:', error);
                return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
            }
        } else {
            // User is logged in with a different email than the invitation
            return NextResponse.redirect(
                new URL(`/invite-error?error=email-mismatch&inviteEmail=${invite.email}`, request.url)
            );
        }
    } catch (error) {
        console.error('Error processing existing user invite:', error);
        return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
    }
}