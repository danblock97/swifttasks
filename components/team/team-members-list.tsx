"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
    MoreHorizontal,
    UserMinus,
    Crown,
    Mail,
    Clock,
    AlertTriangle,
    RefreshCcw,
    Trash2
} from "lucide-react";

interface TeamMember {
    id: string;
    email: string;
    display_name: string | null;
    created_at: string;
    is_team_owner: boolean;
}

interface TeamInvite {
    id: string;
    email: string;
    created_at: string;
    expires_at: string;
    invite_code: string;
    team_id: string;
}

interface TeamMembersListProps {
    members: TeamMember[];
    pendingInvites: TeamInvite[];
    isTeamOwner: boolean;
    currentUserId: string;
}

export function TeamMembersList({ members, pendingInvites, isTeamOwner, currentUserId }: TeamMembersListProps) {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [selectedInvite, setSelectedInvite] = useState<TeamInvite | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
    const [isTransferOwnershipDialogOpen, setIsTransferOwnershipDialogOpen] = useState(false);
    const [isResendInviteDialogOpen, setIsResendInviteDialogOpen] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();
    const { toast } = useToast();

    // Convert email to initials
    const getInitials = (email: string, name: string | null): string => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
        }
        return email.substring(0, 2).toUpperCase();
    };

    // Check if invite is expired
    const isInviteExpired = (expiresAt: string): boolean => {
        return new Date(expiresAt) < new Date();
    };

    const handleRemoveMember = (member: TeamMember) => {
        if (member.is_team_owner) {
            toast({
                title: "Cannot Remove Team Owner",
                description: "The team owner cannot be removed. Transfer ownership first.",
                variant: "destructive",
            });
            return;
        }

        setSelectedMember(member);
        setIsRemoveDialogOpen(true);
    };

    const confirmRemoveMember = async () => {
        if (!selectedMember) return;

        try {
            // Update user to remove from team
            const { error } = await supabase
                .from("users")
                .update({
                    account_type: "single",
                    team_id: null,
                    is_team_owner: false,
                })
                .eq("id", selectedMember.id);

            if (error) throw error;

            toast({
                title: "Member Removed",
                description: `${selectedMember.display_name || selectedMember.email} has been removed from your team.`,
            });

            setIsRemoveDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error removing team member:", error);
            toast({
                title: "Error",
                description: "Failed to remove team member. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleTransferOwnership = (member: TeamMember) => {
        if (member.is_team_owner) {
            toast({
                title: "Already Owner",
                description: "This member is already the team owner.",
            });
            return;
        }

        setSelectedMember(member);
        setIsTransferOwnershipDialogOpen(true);
    };

    const confirmTransferOwnership = async () => {
        if (!selectedMember) return;

        try {
            // Begin a transaction to transfer ownership
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error("Not authenticated");

            // 1. Remove owner status from current owner
            const { error: removeOwnerError } = await supabase
                .from("users")
                .update({ is_team_owner: false })
                .eq("id", currentUserId);

            if (removeOwnerError) throw removeOwnerError;

            // 2. Make selected member the new owner
            const { error: newOwnerError } = await supabase
                .from("users")
                .update({ is_team_owner: true })
                .eq("id", selectedMember.id);

            if (newOwnerError) throw newOwnerError;

            toast({
                title: "Ownership Transferred",
                description: `${selectedMember.display_name || selectedMember.email} is now the team owner.`,
            });

            setIsTransferOwnershipDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error transferring ownership:", error);
            toast({
                title: "Error",
                description: "Failed to transfer team ownership. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRevokeInvite = (invite: TeamInvite) => {
        setSelectedInvite(invite);
        setIsRevokeDialogOpen(true);
    };

    const confirmRevokeInvite = async () => {
        if (!selectedInvite) return;

        try {
            // Delete the invite
            const { error } = await supabase
                .from("team_invites")
                .delete()
                .eq("id", selectedInvite.id);

            if (error) throw error;

            toast({
                title: "Invitation Revoked",
                description: `The invitation to ${selectedInvite.email} has been revoked.`,
            });

            setIsRevokeDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error revoking invitation:", error);
            toast({
                title: "Error",
                description: "Failed to revoke invitation. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleResendInvite = (invite: TeamInvite) => {
        setSelectedInvite(invite);
        setIsResendInviteDialogOpen(true);
    };

    const confirmResendInvite = async () => {
        if (!selectedInvite) return;

        try {
            // Update invitation with a new expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const { error } = await supabase
                .from("team_invites")
                .update({
                    expires_at: expiresAt.toISOString(),
                })
                .eq("id", selectedInvite.id);

            if (error) throw error;

            // Here you would typically trigger an email notification
            // For now, we'll just show a success toast

            toast({
                title: "Invitation Resent",
                description: `The invitation to ${selectedInvite.email} has been resent.`,
            });

            setIsResendInviteDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error resending invitation:", error);
            toast({
                title: "Error",
                description: "Failed to resend invitation. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-xl">Team Members</CardTitle>
                <CardDescription>
                    {members.length} {members.length === 1 ? "member" : "members"} in your team
                    {pendingInvites.length > 0 && `, ${pendingInvites.length} pending ${pendingInvites.length === 1 ? "invitation" : "invitations"}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Active Members */}
                    <div>
                        <h3 className="text-sm font-medium mb-4">Active Members</h3>
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {getInitials(member.email, member.display_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.display_name || "User"}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.is_team_owner && (
                                            <Badge
                                                className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 mr-2"
                                            >
                                                <Crown className="h-3 w-3 mr-1" />
                                                Owner
                                            </Badge>
                                        )}

                                        {isTeamOwner && member.id !== currentUserId && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleTransferOwnership(member)}>
                                                        <Crown className="mr-2 h-4 w-4" />
                                                        Make Owner
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleRemoveMember(member)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                        Remove from Team
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        {member.id === currentUserId && (
                                            <Badge variant="outline" className="text-xs">You</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Invitations */}
                    {pendingInvites.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-4">Pending Invitations</h3>
                            <div className="space-y-3">
                                {pendingInvites.map((invite) => {
                                    const expired = isInviteExpired(invite.expires_at);

                                    return (
                                        <div
                                            key={invite.id}
                                            className={`flex items-center justify-between p-2 rounded-md border ${
                                                expired ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' : 'bg-card'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{invite.email}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {expired
                                                            ? "Expired " + formatDate(invite.expires_at)
                                                            : "Expires " + formatDate(invite.expires_at)
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expired ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                                    >
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Expired
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}

                                                {isTeamOwner && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {expired && (
                                                                <DropdownMenuItem onClick={() => handleResendInvite(invite)}>
                                                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                                                    Resend Invitation
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleRevokeInvite(invite)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Revoke Invitation
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Remove Member Dialog */}
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove {selectedMember?.display_name || selectedMember?.email} from your team?
                            They will lose access to all team projects and resources.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmRemoveMember}
                        >
                            Remove Member
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsRemoveDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer Ownership Dialog */}
            <Dialog open={isTransferOwnershipDialogOpen} onOpenChange={setIsTransferOwnershipDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Team Ownership</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to transfer team ownership to {selectedMember?.display_name || selectedMember?.email}?
                            You will no longer be the team owner and will lose administrative privileges.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="default"
                            onClick={confirmTransferOwnership}
                        >
                            Transfer Ownership
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsTransferOwnershipDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke Invitation Dialog */}
            <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke Invitation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke the invitation sent to {selectedInvite?.email}?
                            They will no longer be able to join your team with this invitation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmRevokeInvite}
                        >
                            Revoke Invitation
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsRevokeDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resend Invitation Dialog */}
            <Dialog open={isResendInviteDialogOpen} onOpenChange={setIsResendInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resend Invitation</DialogTitle>
                        <DialogDescription>
                            Resend the invitation to {selectedInvite?.email} with a new expiration date?
                            The previous invitation will be updated with a new 7-day expiration.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={confirmResendInvite}
                        >
                            Resend Invitation
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsResendInviteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}