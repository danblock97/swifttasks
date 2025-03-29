// app/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, getServiceClient } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
    try {
        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        // Use the auth helper instead of creating a new client and session check
        const { authenticated, response, userId } = await authenticateApiRequest();

        if (!authenticated) {
            return response;
        }

        // Get the service client - only one instance shared across the app
        const serviceClient = await getServiceClient();

        // Verify the notification belongs to this user
        const { data: notification, error: fetchError } = await serviceClient
            .from('user_notifications')
            .select('*')
            .eq('id', notificationId)
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { error: 'Notification not found or access denied' },
                { status: 404 }
            );
        }

        // Mark notification as read
        const { error } = await serviceClient
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