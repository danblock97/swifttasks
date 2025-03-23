// FILE: app/api/team-invite/existing/[code]/route.ts
// NEW FILE to handle existing users accepting team invitations

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        // Resolve the promise to get the actual parameters
        const resolvedParams = await params;
        const inviteCode = resolvedParams.code;

        const url = new URL(request.url);
        const searchParams = Object.fromEntries(url.searchParams.entries());

        // Check for token in various places Supabase might use
        const queryToken = url.searchParams.get('token') ||
            url.searchParams.get('invite_token') ||
            url.searchParams.get('invite_code') ||
            url.searchParams.get('code');

        // Use the token from the URL if available, or fall back to the path parameter
        const codeToUse = queryToken || inviteCode;

        if (!codeToUse) {
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

        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('team_invites')
            .select('*')
            .eq('invite_code', codeToUse)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            return NextResponse.redirect(new URL('/invite-error?error=invalid', request.url));
        }

        // Get the team information
        const { data: team, error: teamError } = await supabaseAdmin
            .from('teams')
            .select('*')
            .eq('id', invite.team_id)
            .single();

        if (teamError || !team) {
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