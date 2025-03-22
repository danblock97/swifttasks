// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
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
                console.log("[Auth Callback] User metadata:", metadata);

                try {
                    // Check if user already exists (to avoid duplicate inserts)
                    const { data: existingUser } = await supabase
                        .from("users")
                        .select("id")
                        .eq("id", user.id)
                        .single();

                    if (!existingUser) {
                        console.log("[Auth Callback] Creating user profile for:", user.id, metadata.account_type);

                        // Create a service role client for admin operations
                        const serviceSupabase = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                            { auth: { persistSession: false } }
                        );

                        // Check if this is a team invitation
                        if (metadata.invite_code) {
                            console.log(`[Auth Callback] Processing invitation with code: ${metadata.invite_code}`);

                            try {
                                // Get the invitation details using service role for full access
                                const { data: invite, error: inviteError } = await serviceSupabase
                                    .from("team_invites")
                                    .select("team_id, email")
                                    .eq("invite_code", metadata.invite_code)
                                    .single();

                                if (inviteError) {
                                    console.error("[Auth Callback] Error fetching invitation:", inviteError);
                                    throw inviteError;
                                }

                                if (invite && invite.email.toLowerCase() === user.email?.toLowerCase()) {
                                    console.log(`[Auth Callback] Creating team member profile for ${user.email}`);

                                    // Create team member profile using service role client
                                    const { error: userError } = await serviceSupabase
                                        .from("users")
                                        .insert({
                                            id: user.id,
                                            email: user.email,
                                            display_name: metadata.display_name || user.email?.split('@')[0],
                                            account_type: "team_member",
                                            team_id: invite.team_id,
                                            is_team_owner: false,
                                        });

                                    if (userError) {
                                        console.error("[Auth Callback] Error creating user profile:", userError);
                                        throw userError;
                                    }

                                    // Delete the invitation
                                    await serviceSupabase
                                        .from("team_invites")
                                        .delete()
                                        .eq("invite_code", metadata.invite_code);

                                    console.log(`[Auth Callback] Team invitation processed successfully`);
                                } else {
                                    console.log(`[Auth Callback] Invitation not found or email mismatch`);
                                    // Fall back to creating a regular account
                                    await serviceSupabase
                                        .from("users")
                                        .insert({
                                            id: user.id,
                                            email: user.email,
                                            display_name: metadata.display_name || user.email?.split('@')[0],
                                            account_type: "single",
                                            is_team_owner: false,
                                        });
                                }
                            } catch (err) {
                                console.error("[Auth Callback] Error processing team invitation:", err);
                                // Fall back to creating a regular account
                                await serviceSupabase
                                    .from("users")
                                    .insert({
                                        id: user.id,
                                        email: user.email,
                                        display_name: metadata.display_name || user.email?.split('@')[0],
                                        account_type: "single",
                                        is_team_owner: false,
                                    });
                            }
                        }
                        // Regular account creation without invitation
                        else if (metadata.account_type === "team") {
                            console.log("[Auth Callback] Creating team account");
                            // Create team first
                            const teamId = generateUUID();

                            await serviceSupabase
                                .from("teams")
                                .insert({
                                    id: teamId,
                                    name: metadata.team_name || "My Team",
                                    owner_id: user.id,
                                });

                            // Create team owner profile
                            await serviceSupabase
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
                            console.log("[Auth Callback] Creating single user account");
                            // Default to single user account
                            await serviceSupabase
                                .from("users")
                                .insert({
                                    id: user.id,
                                    email: user.email,
                                    display_name: metadata.display_name || user.email?.split('@')[0],
                                    account_type: "single",
                                    is_team_owner: false,
                                });
                        }
                        console.log("[Auth Callback] User profile created successfully");
                    } else {
                        console.log("[Auth Callback] User already exists:", existingUser.id);
                    }
                } catch (error) {
                    console.error("[Auth Callback] Error creating user profile:", error);
                }
            }
        }

        return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
        console.error("[Auth Callback] Error in auth callback:", error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
    }
}