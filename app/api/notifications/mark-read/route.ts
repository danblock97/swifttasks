// app/api/notifications/mark-read/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        // Check authentication
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Create a service role client to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Verify the notification belongs to this user
        const { data: notification, error: fetchError } = await supabaseAdmin
            .from('user_notifications')
            .select('*')
            .eq('id', notificationId)
            .eq('user_id', session.user.id)
            .single();

        if (fetchError || !notification) {
            return NextResponse.json(
                { error: 'Notification not found or access denied' },
                { status: 404 }
            );
        }

        // Mark notification as read
        const { error } = await supabaseAdmin
            .from('user_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return NextResponse.json(
                { error: 'Failed to update notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error: any) {
        console.error('Error in mark-read API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}