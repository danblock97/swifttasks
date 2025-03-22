'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [hasResent, setHasResent] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Get the email from localStorage if available
        // We don't store the password, just the email for resending purposes
        const storedEmail = localStorage.getItem('registered_email');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleResendVerification = async () => {
        if (!email) {
            toast({
                title: "Email Not Available",
                description: "Please go back to login and try again",
                variant: "destructive",
            });
            return;
        }

        setIsResending(true);

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to resend verification email');
            }

            setHasResent(true);
            toast({
                title: "Verification Email Sent",
                description: "Please check your inbox for the verification link",
            });
        } catch (error) {
            console.error('Error resending verification:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to resend verification email",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto px-4 py-12">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-muted-foreground">
                    We&apos;ve sent you a verification link to {email ? <span className="font-medium">{email}</span> : "your email"}.
                    Please check your inbox and click the link to verify your account.
                </p>
            </div>

            <div className="w-full p-4 mt-4 bg-muted rounded-lg text-sm text-left">
                <p className="font-medium mb-2">Not seeing the email?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Allow a few minutes for the email to arrive</li>
                </ul>
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
                <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={isResending || hasResent}
                >
                    {isResending ? "Sending..." : hasResent ? "Email Sent" : "Resend Verification"}
                </Button>

                <Link href="/login">
                    <Button variant="outline">Back to Login</Button>
                </Link>
            </div>

            {hasResent && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Verification email has been resent successfully!
                </p>
            )}
        </div>
    );
}