// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { generateUUID } from "@/lib/utils";

export async function GET(request: NextRequest) {
    try {
        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get('code');

        if (code) {
            const cookieStore = cookies();
            const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

            // Exchange code for session
            await supabase.auth.exchangeCodeForSession(code);

            // Get the newly authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const metadata = user.user_metadata || {};

                try {
                    // Check if user already exists (to avoid duplicate inserts)
                    const { data: existingUser } = await supabase
                        .from("users")
                        .select("id")
                        .eq("id", user.id)
                        .single();

                    if (!existingUser) {
                        console.log("Creating user profile for:", user.id, metadata.account_type);

                        // Check if this is a team invitation
                        if (metadata.invite_code) {
                            // Get the invitation details
                            const { data: invite } = await supabase
                                .from("team_invites")
                                .select("team_id, email")
                                .eq("invite_code", metadata.invite_code)
                                .single();

                            if (invite && invite.email.toLowerCase() === user.email?.toLowerCase()) {
                                // Create team member profile
                                await supabase
                                    .from("users")
                                    .insert({
                                        id: user.id,
                                        email: user.email,
                                        display_name: metadata.display_name || user.email?.split('@')[0],
                                        account_type: "team_member",
                                        team_id: invite.team_id,
                                        is_team_owner: false,
                                    });

                                // Delete the invitation
                                await supabase
                                    .from("team_invites")
                                    .delete()
                                    .eq("invite_code", metadata.invite_code);
                            }
                        }
                        // Regular account creation without invitation
                        else if (metadata.account_type === "team") {
                            // Create team first
                            const teamId = generateUUID();

                            await supabase
                                .from("teams")
                                .insert({
                                    id: teamId,
                                    name: metadata.team_name || "My Team",
                                    owner_id: user.id,
                                });

                            // Create team owner profile
                            await supabase
                                .from("users")
                                .insert({
                                    id: user.id,
                                    email: user.email,
                                    display_name: metadata.display_name || user.email?.split('@')[0],
                                    account_type: "team_member",
                                    team_id: teamId,
                                    is_team_owner: true,
                                });
                        } else {
                            // Default to single user account
                            await supabase
                                .from("users")
                                .insert({
                                    id: user.id,
                                    email: user.email,
                                    display_name: metadata.display_name || user.email?.split('@')[0],
                                    account_type: "single",
                                    is_team_owner: false,
                                });
                        }
                        console.log("User profile created successfully");
                    }
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
        }

        return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
        console.error("Error in auth callback:", error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
    }
}