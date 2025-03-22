"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/lib/utils";
import { Mail, Send, Users, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";

interface InviteTeamMemberFormProps {
    teamId: string;
    teamName: string;
    unavailableEmails: string[];
}

export function InviteTeamMemberForm({ teamId, teamName, unavailableEmails }: InviteTeamMemberFormProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);

    const router = useRouter();
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const validateEmail = (email: string): boolean => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const isEmailAvailable = (email: string): boolean => {
        return !unavailableEmails.includes(email.toLowerCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email
        if (!validateEmail(email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }

        // Check if email is already a team member or invited
        if (!isEmailAvailable(email)) {
            toast({
                title: "Email Already Used",
                description: "This email is already a team member or has a pending invitation.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Try to check if user exists without using admin API (which might not be available)
            // We'll determine this from the server side response instead

            // Generate invite code
            const inviteCode = generateUUID();

            // Set expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Create a team invitation record
            const { error: inviteRecordError } = await supabase
                .from("team_invites")
                .insert({
                    id: generateUUID(),
                    email: email.toLowerCase(),
                    team_id: teamId,
                    expires_at: expiresAt.toISOString(),
                    invite_code: inviteCode,
                });

            if (inviteRecordError) throw inviteRecordError;

            // Send the invitation email using our server API route
            const response = await fetch('/api/send-team-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    teamName,
                    inviteCode,
                    teamId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send invitation email');
            }

            // Check if the server indicated this was an existing user
            if (result.userExists || (result.message && result.message.includes('existing user'))) {
                setIsExistingUser(true);
            }

            setIsSuccess(true);
            toast({
                title: "Invitation Sent",
                description: `An invitation has been sent to ${email}.`,
            });
        } catch (error: any) {
            console.error("Error sending invitation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to send invitation. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form for sending another invitation
    const resetForm = () => {
        setEmail("");
        setIsSuccess(false);
        setIsExistingUser(false);
    };

    return (
        <Card>
            {isSuccess ? (
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Invitation Sent!</h2>
                        <p className="text-muted-foreground">
                            An invitation {isExistingUser ? "link" : "email"} has been sent to {email}. They'll need to accept the invitation to join your team.
                        </p>

                        {isExistingUser ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-4 text-sm text-left border border-blue-100 dark:border-blue-800">
                                <div className="flex items-start">
                                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="ml-2">
                                        <p className="text-blue-800 dark:text-blue-300">
                                            <strong>Existing user detected:</strong> We've sent a special invitation link that will allow this user to join your team with their existing account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-muted p-4 rounded-md mt-4 text-sm text-left">
                                <p>
                                    <strong>Note:</strong> The invitation will expire in 7 days. If the invitation expires or isn't received, you can send a new invitation from the team dashboard.
                                </p>
                            </div>
                        )}

                        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="outline" onClick={resetForm}>
                                Invite Another Member
                            </Button>
                            <Link href="/dashboard/team">
                                <Button>Go to Team Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            ) : (
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Invite to {teamName}</CardTitle>
                        <CardDescription>
                            Send an invitation to join your team. They'll receive an email with a link to accept.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 text-sm flex items-start gap-2 border border-blue-100 dark:border-blue-800">
                                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Team Collaboration Benefits</h4>
                                    <p className="mt-1 text-blue-700 dark:text-blue-400">
                                        Team members can collaborate on projects, Kanban boards, and documentation spaces.
                                        They'll have access to all team resources.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-md bg-purple-50 dark:bg-purple-900/20 p-4 text-sm flex items-start gap-2 border border-purple-100 dark:border-purple-800">
                                <UserPlus className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Inviting Existing Users</h4>
                                    <p className="mt-1 text-purple-700 dark:text-purple-400">
                                        You can invite users who already have an account. They'll receive a special link to join your team with their existing account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <Link href="/dashboard/team">
                            <Button type="button" variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Team
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending Invitation...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            )}
        </Card>
    );
}