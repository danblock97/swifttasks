"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/lib/supabase/database.types";
import { generateUUID } from "@/lib/utils";
import { User, Mail, Lock, Building, UserPlus, Users, ArrowRight, CheckCircle2 } from "lucide-react";

type AccountType = "single" | "team";

export function RegisterForm({
                                 initialAccountType = "single",
                             }: {
    initialAccountType: string;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [accountType, setAccountType] = useState<AccountType>(
        initialAccountType === "team" ? "team" : "single"
    );
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClientComponentClient<Database>();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Register the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User registration failed");

            const userId = authData.user.id;

            // 2. Create user profile
            if (accountType === "single") {
                // Create a single user profile
                const { error: profileError } = await supabase
                    .from("users")
                    .insert({
                        id: userId,
                        email,
                        display_name: name,
                        account_type: "single",
                        is_team_owner: false,
                    });

                if (profileError) throw profileError;
            } else {
                // Create a team
                const teamId = generateUUID();

                // Create team
                const { error: teamError } = await supabase
                    .from("teams")
                    .insert({
                        id: teamId,
                        name: teamName,
                        owner_id: userId,
                    });

                if (teamError) throw teamError;

                // Create team owner profile
                const { error: profileError } = await supabase
                    .from("users")
                    .insert({
                        id: userId,
                        email,
                        display_name: name,
                        account_type: "team_member",
                        team_id: teamId,
                        is_team_owner: true,
                    });

                if (profileError) throw profileError;
            }

            toast({
                title: "Registration successful",
                description: "Please check your email to verify your account.",
            });

            // Redirect to verification page
            router.push("/auth/verify");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Registration failed. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto relative">
            {/* Decorative elements inspired by other pages */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-400/20 via-blue-300/20 to-indigo-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-xl"></div>

            <div className="relative bg-card border border-indigo-100/60 dark:border-indigo-800/60 rounded-xl overflow-hidden shadow-md px-6 py-8">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>

                <div className="mb-6 text-center">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/40 dark:to-blue-900/40 mb-4">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600">
                            <UserPlus className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Join SwiftTasks</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create an account to start organizing your tasks
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-1 mb-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose account type</Label>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {/* Solo Card */}
                            <div
                                className={`relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${
                                    accountType === "single"
                                        ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-gradient-to-b from-white to-blue-50 dark:from-transparent dark:to-blue-900/20"
                                        : "border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 bg-gray-50 dark:bg-gray-800/60"
                                }`}
                                onClick={() => setAccountType("single")}
                            >
                                {accountType === "single" && (
                                    <div className="absolute top-2 right-2">
                                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-2 ${
                                    accountType === "single"
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}>
                                    <User className="h-7 w-7" />
                                </div>
                                <span className={`text-sm font-medium ${accountType === "single" ? "text-blue-700 dark:text-blue-400" : ""}`}>
                                    Solo User
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                    Personal productivity
                                </p>

                                {/* Decorative corner gradients when selected */}
                                {accountType === "single" && (
                                    <>
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/30 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-indigo-500/30 to-transparent"></div>
                                    </>
                                )}
                            </div>

                            {/* Team Card */}
                            <div
                                className={`relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${
                                    accountType === "team"
                                        ? "ring-2 ring-teal-500 dark:ring-teal-400 bg-gradient-to-b from-white to-teal-50 dark:from-transparent dark:to-teal-900/20"
                                        : "border border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700 bg-gray-50 dark:bg-gray-800/60"
                                }`}
                                onClick={() => setAccountType("team")}
                            >
                                {accountType === "team" && (
                                    <div className="absolute top-2 right-2">
                                        <div className="h-5 w-5 bg-teal-500 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-2 ${
                                    accountType === "team"
                                        ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                }`}>
                                    <Users className="h-7 w-7" />
                                </div>
                                <span className={`text-sm font-medium ${accountType === "team" ? "text-teal-700 dark:text-teal-400" : ""}`}>
                                    Team
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                    Collaborate together
                                </p>

                                {/* Decorative corner gradients when selected */}
                                {accountType === "team" && (
                                    <>
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-teal-500/30 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/30 to-transparent"></div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-500 dark:text-blue-400">
                                <User className="h-5 w-5" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Your name"
                                className="pl-10 border-blue-200/70 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/20 focus:border-blue-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {accountType === "team" && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-teal-500 dark:text-teal-400">
                                    <Building className="h-5 w-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Team name"
                                    className="pl-10 border-teal-200/70 dark:border-teal-700/50 bg-teal-50/50 dark:bg-teal-900/20 focus:border-teal-400"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-500 dark:text-indigo-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <Input
                                type="email"
                                placeholder="Email address"
                                className="pl-10 border-indigo-200/70 dark:border-indigo-700/50 bg-indigo-50/50 dark:bg-indigo-900/20 focus:border-indigo-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500 dark:text-purple-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-10 border-purple-200/70 dark:border-purple-700/50 bg-purple-50/50 dark:bg-purple-900/20 focus:border-purple-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 8 characters long
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={`w-full h-12 font-medium text-white shadow-md hover:shadow-lg transition-all ${
                            accountType === "single"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                        }`}
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
                                Creating account...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                {accountType === "single" ? "Create Solo Account" : "Create Team Account"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className={`font-medium hover:underline ${
                            accountType === "single" ? "text-blue-600 dark:text-blue-400" : "text-teal-600 dark:text-teal-400"
                        }`}>
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-5 pt-5 text-center border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">
                        By signing up, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}