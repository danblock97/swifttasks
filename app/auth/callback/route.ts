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

        console.log("[Auth Callback] Got user:", user.id, "Email:", user.email);
        console.log("[Auth Callback] User metadata:", JSON.stringify(user.user_metadata));

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

        console.log("[Auth Callback] Existing user check:", existingUser ? "Found" : "Not found");

        if (!existingUser) {
            const metadata = user.user_metadata || {};
            console.log("[Auth Callback] Processing metadata for new user:", JSON.stringify(metadata));

            // Handle different account creation scenarios
            try {
                // Check if this is a team invitation
                if (metadata.invite_code) {
                    console.log("[Auth Callback] Processing team invitation with code:", metadata.invite_code);

                    // Get the invitation details
                    const { data: invite, error: inviteError } = await serviceSupabase
                        .from("team_invites")
                        .select("team_id, email")
                        .eq("invite_code", metadata.invite_code)
                        .single();

                    if (inviteError) {
                        console.error("[Auth Callback] Error fetching invitation:", inviteError);
                        console.log("[Auth Callback] Falling back to creating a regular account");

                        // Fall back to creating a regular account
                        const { error: insertError } = await serviceSupabase
                            .from("users")
                            .insert({
                                id: user.id,
                                email: user.email,
                                display_name: metadata.display_name || user.email?.split('@')[0],
                                account_type: "single",
                                is_team_owner: false,
                            });

                        if (insertError) {
                            console.error("[Auth Callback] Error creating regular user:", insertError);
                            throw insertError;
                        }
                    } else if (invite && invite.email.toLowerCase() === user.email?.toLowerCase()) {
                        console.log("[Auth Callback] Creating team member profile");

                        // Create team member profile
                        const { error: insertError } = await serviceSupabase
                            .from("users")
                            .insert({
                                id: user.id,
                                email: user.email,
                                display_name: metadata.display_name || user.email?.split('@')[0],
                                account_type: "team_member",
                                team_id: invite.team_id,
                                is_team_owner: false,
                            });

                        if (insertError) {
                            console.error("[Auth Callback] Error creating team member:", insertError);
                            throw insertError;
                        }

                        // Delete the invitation
                        await serviceSupabase
                            .from("team_invites")
                            .delete()
                            .eq("invite_code", metadata.invite_code);
                    } else {
                        console.log("[Auth Callback] Invalid invitation, creating regular account");

                        // Fall back to creating a regular account
                        const { error: insertError } = await serviceSupabase
                            .from("users")
                            .insert({
                                id: user.id,
                                email: user.email,
                                display_name: metadata.display_name || user.email?.split('@')[0],
                                account_type: "single",
                                is_team_owner: false,
                            });

                        if (insertError) {
                            console.error("[Auth Callback] Error creating regular user fallback:", insertError);
                            throw insertError;
                        }
                    }
                }
                // Handle team account creation
                else if (metadata.account_type === "team") {
                    console.log("[Auth Callback] Creating team account");

                    // Create team first
                    const teamId = generateUUID();
                    console.log("[Auth Callback] Generated team ID:", teamId);

                    const { error: teamError } = await serviceSupabase
                        .from("teams")
                        .insert({
                            id: teamId,
                            name: metadata.team_name || "My Team",
                            owner_id: user.id,
                        });

                    if (teamError) {
                        console.error("[Auth Callback] Error creating team:", teamError);
                        throw teamError;
                    }

                    // Create team owner profile
                    const { error: insertError } = await serviceSupabase
                        .from("users")
                        .insert({
                            id: user.id,
                            email: user.email,
                            display_name: metadata.display_name || user.email?.split('@')[0],
                            account_type: "team_member",
                            team_id: teamId,
                            is_team_owner: true,
                        });

                    if (insertError) {
                        console.error("[Auth Callback] Error creating team owner:", insertError);
                        throw insertError;
                    }
                } else {
                    // Default to single user account
                    console.log("[Auth Callback] Creating single user account");

                    const { error: insertError } = await serviceSupabase
                        .from("users")
                        .insert({
                            id: user.id,
                            email: user.email,
                            display_name: metadata.display_name || user.email?.split('@')[0],
                            account_type: "single",
                            is_team_owner: false,
                        });

                    if (insertError) {
                        console.error("[Auth Callback] Error creating single user:", insertError);
                        throw insertError;
                    }
                }

                console.log("[Auth Callback] User profile created successfully for:", user.id);
            } catch (error) {
                console.error("[Auth Callback] Error creating user profile:", error);

                // Try one more time with a simple insert
                try {
                    console.log("[Auth Callback] Attempting fallback user creation");
                    const { error: fallbackError } = await serviceSupabase
                        .from("users")
                        .insert({
                            id: user.id,
                            email: user.email,
                            display_name: user.email?.split('@')[0],
                            account_type: "single",
                            is_team_owner: false,
                        });

                    if (!fallbackError) {
                        console.log("[Auth Callback] Fallback user creation successful");
                    } else {
                        console.error("[Auth Callback] Fallback creation failed:", fallbackError);
                    }
                } catch (fallbackError) {
                    console.error("[Auth Callback] Fallback error:", fallbackError);
                }
            }
        } else {
            console.log("[Auth Callback] User already exists:", existingUser.id);
        }
        return NextResponse.redirect(new URL('/auth/setting-up-account', request.url));
    } catch (error) {
        console.error("[Auth Callback] Error in auth callback:", error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
    }
}