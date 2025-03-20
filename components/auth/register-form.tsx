"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/lib/supabase/database.types";
import { generateUUID } from "@/lib/utils";

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
        <div className="grid gap-6">
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label
                            htmlFor="account-type"
                            className="text-sm font-medium leading-none"
                        >
                            Account Type
                        </label>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant={accountType === "single" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setAccountType("single")}
                            >
                                Single User
                            </Button>
                            <Button
                                type="button"
                                variant={accountType === "team" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setAccountType("team")}
                            >
                                Team
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none">
                            Your Name
                        </label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {accountType === "team" && (
                        <div className="grid gap-2">
                            <label
                                htmlFor="team-name"
                                className="text-sm font-medium leading-none"
                            >
                                Team Name
                            </label>
                            <Input
                                id="team-name"
                                placeholder="Acme Inc."
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                disabled={isLoading}
                                required={accountType === "team"}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium leading-none"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">
                            Password must be at least 8 characters long
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                            <svg
                                className="mr-2 h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        )}
                        Sign Up
                    </Button>
                </div>
            </form>
        </div>
    );
}