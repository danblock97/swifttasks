'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/hooks/use-toast";

export default function SettingUpAccountPage() {
    const [count, setCount] = useState(0);
    const [isChecking, setIsChecking] = useState(true);
    const [debugInfo, setDebugInfo] = useState<string[]>([]);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Add debug information
    const addDebug = (message: string) => {
        setDebugInfo(prev => [...prev, message]);
    };

    useEffect(() => {
        // Clear any existing intervals when component mounts
        const intervalIds: NodeJS.Timeout[] = [];

        // Function to check if the profile exists
        const checkProfile = async () => {
            if (!isChecking) return;

            try {
                setIsChecking(true);
                addDebug(`Checking profile (attempt ${count + 1})...`);

                // Get the authenticated user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    addDebug(`Auth error: ${userError.message}`);
                    return;
                }

                if (!user) {
                    addDebug('No authenticated user found');
                    router.push('/login');
                    return;
                }

                addDebug(`User found: ${user.id.substring(0, 8)}...`);

                // Check for the user profile with explicit count
                const { data: profile, error: profileError, count: profileCount } = await supabase
                    .from('users')
                    .select('id', { count: 'exact' })
                    .eq('id', user.id);

                if (profileError) {
                    addDebug(`Profile query error: ${profileError.message}`);
                    return;
                }

                // Log the response for debugging
                addDebug(`Profile check result: ${profileCount || 0} profiles found`);

                // If profile exists, redirect to dashboard
                if (profileCount && profileCount > 0) {
                    addDebug('Profile found, redirecting to dashboard...');
                    setIsChecking(false);

                    // Show success toast
                    toast({
                        title: "Account setup complete",
                        description: "Redirecting to your dashboard..."
                    });

                    // Hard navigation to avoid any caching issues
                    window.location.href = '/dashboard';
                }
            } catch (error: any) {
                addDebug(`Unexpected error: ${error.message || 'Unknown error'}`);
                console.error('Error checking profile:', error);
            }
        };

        // Check immediately
        checkProfile();

        // Then check every 2 seconds
        const interval = setInterval(() => {
            setCount(c => c + 1);
            checkProfile();
        }, 2000);

        intervalIds.push(interval);

        // Clear interval on unmount
        return () => {
            intervalIds.forEach(id => clearInterval(id));
        };
    }, []);

    const manualRedirect = () => {
        // Force redirect to dashboard
        window.location.href = '/dashboard';
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border shadow-md text-center">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Setting up your account</h1>
                    <p className="text-muted-foreground">
                        Please wait while we finish setting up your account...
                    </p>
                </div>

                <div className="flex justify-center my-8">
                    <div className="animate-spin h-10 w-10 border-4 border-primary/20 rounded-full border-t-primary"></div>
                </div>

                <p className="text-sm text-muted-foreground">
                    This should only take a few seconds.
                    {count > 5 && (
                        <div className="mt-4 space-y-2">
                            <p>It's taking longer than expected.</p>
                            <button
                                onClick={manualRedirect}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 w-full"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </p>

                {/* Debug information - hidden by default */}
                {count > 10 && (
                    <div className="mt-8 text-left">
                        <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Debug Information</summary>
                            <div className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-40">
                                {debugInfo.map((msg, i) => (
                                    <div key={i} className="mb-1">{msg}</div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}