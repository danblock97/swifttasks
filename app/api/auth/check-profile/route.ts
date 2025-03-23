// app/api/auth/check-profile/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
    console.log('API endpoint called!'); // Debug log

    try {
        // Get the authenticated user session
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.log('No session found'); // Debug log
            return NextResponse.json({ exists: false, error: 'Not authenticated' }, { status: 401 });
        }

        console.log(`Session found for user: ${session.user.id.substring(0, 8)}...`); // Debug log

        // Use service role to check profile (secure on server)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Don't use .single() to avoid the error if multiple rows exist
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('users')
            .select('id, email, display_name, account_type')
            .eq('id', session.user.id);

        if (profilesError) {
            console.log(`Database error: ${profilesError.message}`); // Debug log
            return NextResponse.json({
                exists: false,
                error: profilesError.message
            });
        }

        // No profiles found
        if (!profiles || profiles.length === 0) {
            console.log('No profile found'); // Debug log
            return NextResponse.json({
                exists: false,
                error: 'User profile not found'
            });
        }

        // If multiple profiles exist (unlikely but handling it), use the first one
        if (profiles.length > 1) {
            console.log(`Found ${profiles.length} profiles for user ID ${session.user.id}`); // Debug log
        }

        console.log('Profile found!'); // Debug log

        return NextResponse.json({
            exists: true,
            profile: profiles[0]
        });
    } catch (error: any) {
        console.error('Unexpected error in check-profile API:', error); // Debug log
        return NextResponse.json({
            exists: false,
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}