// FILE: app/api/send-team-invite/route.ts
// Fixed version with TypeScript errors corrected

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, teamName, inviteCode: providedInviteCode, teamId } = await request.json();

        if (!email || !teamName || !providedInviteCode || !teamId) {
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
            .select('is_team_owner, team_id, display_name')
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
                { error: 'Not authorized to send invitations for this team' },
                { status: 403 }
            );
        }

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Check if the user already exists
        const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();

        // Manually find the user with matching email
        const existingUser = allUsers?.users?.find(user =>
            user.email?.toLowerCase() === email.toLowerCase()
        );

        const userExists = !!existingUser;
        console.log(`[Send Invite] User exists: ${userExists}`);

        // Create invitation URLs
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

        // For existing users, use a different URL format without signup flow
        const inviteUrl = userExists
            ? `${baseUrl}/api/team-invite/existing/${providedInviteCode}`
            : `${baseUrl}/api/team-invite/${providedInviteCode}`;

        // Also create a URL with the code as a query parameter
        const inviteUrlWithQuery = userExists
            ? `${baseUrl}/api/team-invite/existing/accept?code=${providedInviteCode}`
            : `${baseUrl}/api/team-invite/accept?code=${providedInviteCode}`;

        console.log(`[Send Invite] Generated primary invite URL: ${inviteUrl}`);
        console.log(`[Send Invite] Generated alternate invite URL: ${inviteUrlWithQuery}`);

        // Set expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create a team invitation record
        const { error: inviteRecordError } = await supabaseAdmin
            .from("team_invites")
            .insert({
                id: crypto.randomUUID(),
                email: email.toLowerCase(),
                team_id: teamId,
                expires_at: expiresAt.toISOString(),
                invite_code: providedInviteCode,
            });

        if (inviteRecordError) {
            throw new Error(`Failed to create invitation record: ${inviteRecordError.message}`);
        }

        // If the user exists, create a notification instead of sending an email
        if (userExists && existingUser?.id) {
            // Create a notification in the database
            const { error: notificationError } = await supabaseAdmin
                .from("user_notifications")
                .insert({
                    user_id: existingUser.id,
                    type: "team_invitation",
                    title: `Invitation to join ${teamName}`,
                    content: `You've been invited to join ${teamName} as a team member.`,
                    data: {
                        team_id: teamId,
                        team_name: teamName,
                        invite_code: providedInviteCode,
                        inviter_id: session.user.id,
                        inviter_name: userProfile.display_name || session.user.email
                    },
                    is_read: false,
                    created_at: new Date().toISOString()
                });

            if (notificationError) {
                console.error('Error creating notification:', notificationError);
                throw new Error(`Failed to create user notification: ${notificationError.message}`);
            }

            return NextResponse.json({
                success: true,
                message: 'Invitation notification created for existing user',
                userExists: true
            });
        } else {
            // For new users, use the standard Supabase invitation flow
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                redirectTo: inviteUrlWithQuery,
                data: {
                    invite_code: providedInviteCode,
                    teamId,
                    teamName
                }
            });

            if (inviteError) {
                console.error('Supabase invitation error:', inviteError);
                return NextResponse.json(
                    { error: 'Failed to send invitation email', details: inviteError },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Invitation email sent to new user',
                userExists: false
            });
        }
    } catch (error: any) {
        console.error('Error in send-team-invite API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send invitation' },
            { status: 500 }
        );
    }
}