// app/api/auth/check-profile/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
    try {
        // Get the authenticated user session
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ exists: false, error: 'Not authenticated' }, { status: 401 });
        }

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
            return NextResponse.json({
                exists: false,
                error: error.message
            });
        }

        return NextResponse.json({
            exists: !!profile,
            profile: profile || null
        });
    } catch (error: any) {
        return NextResponse.json({
            exists: false,
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}