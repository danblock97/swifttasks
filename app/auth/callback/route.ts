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

        if (!code) {
            console.error("[Auth Callback] No code parameter found");
            return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
        }

        // Exchange code for session
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error("[Auth Callback] Code exchange error:", exchangeError);
            return NextResponse.redirect(new URL('/login?error=code_exchange_failed', request.url));
        }

        // Get the newly authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("[Auth Callback] User fetch error:", userError);
            return NextResponse.redirect(new URL('/login?error=user_fetch_failed', request.url));
        }

        // Create a service role client for admin operations
        const serviceSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Check if user already exists (to avoid duplicate inserts)
        const { data: existingUser, error: existingUserError } = await serviceSupabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (existingUserError) {
            console.error("[Auth Callback] Error checking existing user:", existingUserError);
        }

        if (!existingUser) {
            const metadata = user.user_metadata || {};

            // Handle different account creation scenarios
            try {
                // Check if this is a team invitation
                if (metadata.invite_code) {
                    // Get the invitation details
                    const { data: invite, error: inviteError } = await serviceSupabase
                        .from("team_invites")
                        .select("team_id, email")
                        .eq("invite_code", metadata.invite_code)
                        .single();

                    if (inviteError) {
                        console.error("[Auth Callback] Error fetching invitation:", inviteError);
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
                    } else if (invite && invite.email.toLowerCase() === user.email?.toLowerCase()) {
                        // Create team member profile
                        await serviceSupabase
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
                        await serviceSupabase
                            .from("team_invites")
                            .delete()
                            .eq("invite_code", metadata.invite_code);
                    } else {
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
                // Handle team account creation
                else if (metadata.account_type === "team") {
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

                console.log("[Auth Callback] User profile created successfully for:", user.id);
            } catch (error) {
                console.error("[Auth Callback] Error creating user profile:", error);
            }
        } else {
            console.log("[Auth Callback] User already exists:", existingUser.id);
        }

        // Redirect to the setup page instead of dashboard
        // This gives the database operations time to complete
        return NextResponse.redirect(new URL('/auth/setting-up-account', request.url));
    } catch (error) {
        console.error("[Auth Callback] Error in auth callback:", error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
    }
}