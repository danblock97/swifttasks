// app/api/team-invite/validate/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const inviteCode = url.searchParams.get('code');

        console.log(`[Validate Invite] Checking invitation with code: ${inviteCode}`);

        if (!inviteCode) {
            return NextResponse.json({
                valid: false,
                error: 'No invitation code provided'
            });
        }

        // Create a Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Check if the invitation exists and is valid
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('team_invites')
            .select('*, teams(name)')
            .eq('invite_code', inviteCode)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            console.log(`[Validate Invite] Error or no invite found:`, inviteError);
            return NextResponse.json({
                valid: false,
                error: inviteError?.message || 'Invitation not found or expired'
            });
        }

        // Return the invitation details
        return NextResponse.json({
            valid: true,
            invite: {
                email: invite.email,
                teamName: invite.teams?.name || 'Team',
                inviteCode: invite.invite_code,
                teamId: invite.team_id,
                expiresAt: invite.expires_at
            }
        });
    } catch (error) {
        console.error('[Validate Invite] Error:', error);
        return NextResponse.json({
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}