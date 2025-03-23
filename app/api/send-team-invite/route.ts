// FILE: app/api/send-team-invite/route.ts
// Final fixed version that allows re-invitations

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

        // Check if an invitation already exists for this email and team
        const { data: existingInvite, error: inviteCheckError } = await supabaseAdmin
            .from("team_invites")
            .select("*")
            .eq("email", email.toLowerCase())
            .eq("team_id", teamId)
            .gte("expires_at", new Date().toISOString())
            .maybeSingle();

        if (inviteCheckError) {
            console.error('Error checking existing invites:', inviteCheckError);
        }

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

        // Set expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // If an invitation already exists, update it instead of returning an error
        if (existingInvite) {
            // Update the existing invitation with a new expiration date and code
            const { error: updateError } = await supabaseAdmin
                .from("team_invites")
                .update({
                    expires_at: expiresAt.toISOString(),
                    invite_code: providedInviteCode
                })
                .eq("id", existingInvite.id);

            if (updateError) {
                console.error('Error updating invitation:', updateError);
                throw new Error(`Failed to update invitation: ${updateError.message}`);
            }

        } else {
            // Create a new team invitation record
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
        }

        // If the user exists, create a notification instead of sending an email
        if (userExists && existingUser?.id) {
            // Check if they already have a notification for this team
            const { data: existingNotification } = await supabaseAdmin
                .from("user_notifications")
                .select("*")
                .eq("user_id", existingUser.id)
                .eq("type", "team_invitation")
                .like("data->team_id", teamId)
                .maybeSingle();

            if (existingNotification) {
                // Update the existing notification
                const { error: updateNotificationError } = await supabaseAdmin
                    .from("user_notifications")
                    .update({
                        is_read: false, // Mark as unread if it was read
                        created_at: new Date().toISOString(), // Update timestamp
                        data: {
                            team_id: teamId,
                            team_name: teamName,
                            invite_code: providedInviteCode,
                            inviter_id: session.user.id,
                            inviter_name: userProfile.display_name || session.user.email
                        }
                    })
                    .eq("id", existingNotification.id);

                if (updateNotificationError) {
                    console.error('Error updating notification:', updateNotificationError);
                    // Continue anyway - not critical
                }
            } else {
                // Create a new notification
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
            }

            return NextResponse.json({
                success: true,
                message: 'Invitation notification created for existing user',
                userExists: true
            });
        } else {
            // For new users, we don't use Supabase's built-in invitation anymore
            // You would implement your own email sending logic here

            return NextResponse.json({
                success: true,
                message: 'Invitation record created for new user',
                userExists: false,
                inviteCode: providedInviteCode,
                inviteUrl: inviteUrlWithQuery
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