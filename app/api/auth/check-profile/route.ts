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

        const { data: profile, error } = await supabaseAdmin
            .from('users')
            .select('id, email, display_name, account_type')
            .eq('id', session.user.id)
            .single();

        if (error) {
            console.log(`Database error: ${error.message}`); // Debug log
            return NextResponse.json({
                exists: false,
                error: error.message
            });
        }

        console.log(`Profile ${profile ? 'found' : 'not found'}`); // Debug log

        return NextResponse.json({
            exists: !!profile,
            profile: profile || null
        });
    } catch (error: any) {
        console.error('Unexpected error in check-profile API:', error); // Debug log
        return NextResponse.json({
            exists: false,
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}