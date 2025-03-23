import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        // Redirect to the original handler with the code in the path
        return NextResponse.redirect(new URL(`/api/team-invite/${code}`, request.url));
    } catch (error) {
        console.error('Error in accept endpoint:', error);
        return NextResponse.redirect(new URL('/invite-error?error=server', request.url));
    }
}