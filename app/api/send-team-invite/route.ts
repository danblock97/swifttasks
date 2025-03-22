// app/api/send-team-invite/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, teamName, inviteCode, teamId } = await request.json();

        if (!email || !teamName || !inviteCode || !teamId) {
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
            .select('is_team_owner, team_id')
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

        // Try multiple URL formats for maximum compatibility
        // Direct code in URL path
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
        const inviteUrl = `${baseUrl}/api/team-invite/${inviteCode}`;

        // Also create a URL with the code as a query parameter
        const inviteUrlWithQuery = `${baseUrl}/api/team-invite/accept?code=${inviteCode}`;

        console.log(`[Send Invite] Generated primary invite URL: ${inviteUrl}`);
        console.log(`[Send Invite] Generated alternate invite URL: ${inviteUrlWithQuery}`);

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Use the admin client to send the invitation - IMPORTANT: we're using inviteUrlWithQuery here
        // as Supabase tends to preserve query parameters better in some cases
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: inviteUrlWithQuery,
            data: {
                invite_code: inviteCode,
                teamId,
                teamName
            }
        });

        if (inviteError) {
            console.error('Supabase invitation error:', inviteError);

            // Option 2: Fallback to an email service integration
            // This is where you would integrate with a service like SendGrid, Mailgun, etc.
            // Here's a placeholder for that logic:
            /*
            const { data, error: emailError } = await sendEmailViaService({
                to: email,
                subject: `Invitation to join ${teamName} on SwiftTasks`,
                html: `
                    <h1>You've been invited to join ${teamName}</h1>
                    <p>Click the link below to accept the invitation:</p>
                    <a href="${inviteUrl}">Accept Invitation</a>
                `
            });

            if (emailError) {
                throw emailError;
            }
            */

            // For now, we'll return the invite error
            return NextResponse.json(
                { error: 'Failed to send invitation email', details: inviteError },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in send-team-invite API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send invitation' },
            { status: 500 }
        );
    }
}