// app/api/auth/create-profile/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId, email, displayName, teamId, inviteCode } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'User ID and email are required' },
                { status: 400 }
            );
        }

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userId)
            .single();

        if (existingUser) {

            // If this is a team invitation, update the user to join the team
            if (teamId && inviteCode) {
                // Get invitation to verify
                const { data: invite } = await supabaseAdmin
                    .from("team_invites")
                    .select("*")
                    .eq("invite_code", inviteCode)
                    .single();

                if (invite && invite.email.toLowerCase() === email.toLowerCase()) {
                    // Update user to join team
                    await supabaseAdmin
                        .from("users")
                        .update({
                            account_type: "team_member",
                            team_id: teamId,
                            is_team_owner: false,
                        })
                        .eq("id", userId);

                    // Delete the invitation
                    await supabaseAdmin
                        .from("team_invites")
                        .delete()
                        .eq("id", invite.id);
                }
            }

            return NextResponse.json({ success: true, status: "updated" });
        }

        // Create profile based on whether it's a team invite or regular signup
        if (teamId && inviteCode) {

            // Verify the invitation is valid
            const { data: invite } = await supabaseAdmin
                .from("team_invites")
                .select("*")
                .eq("invite_code", inviteCode)
                .single();

            if (!invite) {
                return NextResponse.json(
                    { error: "Invalid invitation code" },
                    { status: 400 }
                );
            }

            // Create team member profile
            const { error: userError } = await supabaseAdmin
                .from("users")
                .insert({
                    id: userId,
                    email: email,
                    display_name: displayName || email?.split('@')[0],
                    account_type: "team_member",
                    team_id: teamId,
                    is_team_owner: false,
                });

            if (userError) {
                console.error("[Create Profile API] Error creating user profile:", userError);
                return NextResponse.json(
                    { error: userError.message },
                    { status: 500 }
                );
            }

            // Delete the invitation
            await supabaseAdmin
                .from("team_invites")
                .delete()
                .eq("id", invite.id);
        } else {

            const { error: userError } = await supabaseAdmin
                .from("users")
                .insert({
                    id: userId,
                    email: email,
                    display_name: displayName || email?.split('@')[0],
                    account_type: "single",
                    is_team_owner: false,
                });

            if (userError) {
                console.error("[Create Profile API] Error creating user profile:", userError);
                return NextResponse.json(
                    { error: userError.message },
                    { status: 500 }
                );
            }
        }
        return NextResponse.json({ success: true, status: "created" });
    } catch (error) {
        console.error('[Create Profile API] Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}