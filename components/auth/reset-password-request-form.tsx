"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Mail, ArrowRight, ShieldQuestion } from "lucide-react";

export function ResetPasswordRequestForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClientComponentClient();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password/update`,
            });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            toast({
                title: "Reset email sent",
                description: "Check your email for a password reset link.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto relative">
            {/* Decorative elements inspired by other pages */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400/20 via-blue-300/20 to-teal-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-xl"></div>

            <div className="relative bg-card border border-purple-100/60 dark:border-purple-800/60 rounded-xl overflow-hidden shadow-md px-6 py-8">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500"></div>

                <div className="mb-8 text-center">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 mb-4">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                            <ShieldQuestion className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isSubmitted ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Please check your email inbox and spam folder.
                            </p>
                        </div>
                        <Button
                            className="w-full h-12 font-medium text-base"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Send another link
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500 dark:text-purple-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Your email address"
                                    className="pl-10 border-purple-200/70 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-900/20 focus:border-purple-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 font-medium text-base bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
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
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    Send Reset Link
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Remembered your password?{" "}
                        <Link href="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}