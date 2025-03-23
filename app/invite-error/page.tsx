'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, User, Mail } from 'lucide-react';

// Create a separate component that uses the useSearchParams hook
function InviteErrorContent() {
    const searchParams = useSearchParams();
    const errorType = searchParams.get('error');
    const inviteEmail = searchParams.get('inviteEmail');

    // Define error messages based on error type
    const getErrorDetails = () => {
        switch (errorType) {
            case 'invalid':
                return {
                    title: 'Invalid Invitation',
                    description: 'This invitation link is invalid or has expired. Please contact the team owner for a new invitation.',
                };
            case 'team-not-found':
                return {
                    title: 'Team Not Found',
                    description: 'The team associated with this invitation no longer exists. Please contact the person who invited you.',
                };
            case 'email-mismatch':
                return {
                    title: 'Email Mismatch',
                    description: `This invitation was sent to ${inviteEmail}, but you're logged in with a different email. Please log out and sign in with ${inviteEmail}, or contact the team owner.`,
                };
            case 'server':
                return {
                    title: 'Server Error',
                    description: 'An unexpected error occurred while processing your invitation. Please try again later or contact support.',
                };
            default:
                return {
                    title: 'Invitation Error',
                    description: 'An error occurred with your team invitation. Please contact the team owner for assistance.',
                };
        }
    };

    const errorDetails = getErrorDetails();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight">{errorDetails.title}</h1>
                <p className="text-muted-foreground">{errorDetails.description}</p>

                <div className="pt-8 flex flex-col gap-4">
                    {errorType === 'email-mismatch' && (
                        <Link href="/api/auth/signout" className="w-full">
                            <Button className="w-full" variant="outline">
                                <User className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </Link>
                    )}

                    {errorType === 'invalid' && (
                        <Link href="/login" className="w-full">
                            <Button className="w-full" variant="outline">
                                <Mail className="mr-2 h-4 w-4" />
                                Sign In
                            </Button>
                        </Link>
                    )}

                    <Link href="/" className="w-full">
                        <Button className="w-full">
                            <Home className="mr-2 h-4 w-4" />
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function InviteErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
                </div>
            </div>
        }>
            <InviteErrorContent />
        </Suspense>
    );
}