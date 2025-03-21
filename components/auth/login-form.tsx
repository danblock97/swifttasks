"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, ArrowRight, UserCircle2 } from "lucide-react";
import { getCookie, setCookie, removeCookie, COOKIE_KEYS, getRememberMe } from "@/lib/cookies";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClientComponentClient();

    // Load remembered email if available
    useEffect(() => {
        const rememberedEmail = getCookie("remembered_email");
        const wasRemembered = getRememberMe();

        if (rememberedEmail && wasRemembered) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Handle remember me functionality
            if (rememberMe) {
                setCookie("remembered_email", email);
                setCookie(COOKIE_KEYS.REMEMBER_ME, "true");
            } else {
                removeCookie("remembered_email");
                removeCookie(COOKIE_KEYS.REMEMBER_ME);
            }

            toast({
                title: "Logged in successfully",
                description: "Redirecting to your dashboard...",
            });

            router.refresh();
            router.push("/dashboard");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to log in. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto relative">
            {/* Decorative elements inspired by other pages */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-teal-400/20 via-blue-300/20 to-indigo-400/20 rounded-full blur-xl"></div>

            <div className="relative bg-card border border-blue-100/60 dark:border-blue-800/60 rounded-xl overflow-hidden shadow-md px-6 py-8">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                <div className="mb-8 text-center">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 mb-4">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                            <UserCircle2 className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign in to continue your productive journey
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-500 dark:text-blue-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-10 border-blue-200/70 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/20 focus:border-blue-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-500 dark:text-indigo-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-10 border-indigo-200/70 dark:border-indigo-700/50 bg-indigo-50/50 dark:bg-indigo-900/20 focus:border-indigo-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => {
                                            if (typeof checked === 'boolean') {
                                                setRememberMe(checked);
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="border-blue-300 dark:border-blue-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <Link href="/reset-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 font-medium text-base bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Signing in...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                Sign in
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}