// app/api/notifications/delete/route.ts
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

        // First check authentication
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

        if (fetchError) {
            console.error('Error fetching notification:', fetchError);

            if (fetchError.code === 'PGRST116') {
                // Not found - might have been already deleted
                return NextResponse.json({
                    success: true,
                    message: 'Notification not found or already deleted'
                });
            }

            return NextResponse.json(
                { error: 'Error fetching notification details' },
                { status: 500 }
            );
        }

        if (!notification) {
            // Notification doesn't exist or doesn't belong to user
            return NextResponse.json({
                success: true,
                message: 'Notification not found or already deleted'
            });
        }

        // Delete the notification with admin privileges
        const { error: deleteError } = await supabaseAdmin
            .from('user_notifications')
            .delete()
            .eq('id', notificationId);

        if (deleteError) {
            console.error('Error deleting notification:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error: any) {
        console.error('Error in delete-notification API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}