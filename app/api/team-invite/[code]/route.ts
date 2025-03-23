// app/api/team-invite/[code]/route.ts
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

        // DEBUG INFO: Output all request information
        console.log(`[Team Invite] Processing invite URL: ${request.url}`);

        const url = new URL(request.url);
        const searchParams = Object.fromEntries(url.searchParams.entries());

        console.log(`[Team Invite] Path parameter code: ${inviteCode}`);
        console.log(`[Team Invite] All query parameters:`, searchParams);

        // Check for token in various places Supabase might use
        const queryToken = url.searchParams.get('token') ||
            url.searchParams.get('invite_token') ||
            url.searchParams.get('invite_code') ||
            url.searchParams.get('code');

        // Use the token from the URL if available, or fall back to the path parameter
        const codeToUse = queryToken || inviteCode;

        console.log(`[Team Invite] Final code to use: ${codeToUse}`);

        if (!codeToUse) {
            console.log(`[Team Invite] No invitation code found in request`);
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

        // Try multiple approaches to find the invitation - use admin client to bypass RLS
        console.log(`[Team Invite] Searching for invitation with code: ${codeToUse}`);

        // First approach: exact match on invite_code
        let { data: invite, error: inviteError } = await supabaseAdmin
            .from('team_invites')
            .select('*')
            .eq('invite_code', codeToUse)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError) {
            console.log(`[Team Invite] Error with exact match search:`, inviteError);

            // Second approach: try to compare case-insensitive
            const { data: allInvites } = await supabaseAdmin
                .from('team_invites')
                .select('*')
                .gte('expires_at', new Date().toISOString());

            console.log(`[Team Invite] Found ${allInvites?.length || 0} valid invites in total`);

            // See if any match with case-insensitive comparison
            if (allInvites && allInvites.length > 0) {
                const matchingInvite = allInvites.find(inv =>
                    inv.invite_code && codeToUse &&
                    inv.invite_code.toLowerCase() === codeToUse.toLowerCase()
                );

                if (matchingInvite) {
                    console.log(`[Team Invite] Found invite with case-insensitive match:`, matchingInvite);
                    invite = matchingInvite;
                    inviteError = null;
                } else {
                    console.log(`[Team Invite] No match found with case-insensitive comparison`);
                    // Log all invite codes for debugging
                    console.log(`[Team Invite] All invite codes in DB:`);
                    allInvites.forEach(inv => {
                        console.log(`- ${inv.invite_code} for ${inv.email}`);
                    });
                }
            }
        }

        if (!invite) {
            // Log the issue for debugging
            console.log(`No valid invitation found for code: ${codeToUse}`);

            // Let's check all invites for debugging
            const { data: allInvites } = await supabase
                .from('team_invites')
                .select('invite_code, email, expires_at')
                .limit(5);

            console.log('Recent invites in system:', allInvites);

            // Invitation not found or expired
            return NextResponse.redirect(new URL('/invite-error?error=invalid', request.url));
        }

        // Get the team information - use admin client to bypass RLS
        const { data: team, error: teamError } = await supabaseAdmin
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
                // Update user to join the team - use admin client for this too
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
                new URL(`/register?email=${encodeURIComponent(invite.email)}&invite=${codeToUse}`, request.url)
            );
        }
    } catch (error) {
        console.error('Error processing invite:', error);
        return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
    }
}