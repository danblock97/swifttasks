"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

interface DashboardWrapperProps {
    children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
    const [projectLimits, setProjectLimits] = useState<{
        hasReachedLimit: boolean;
        isTeamMember: boolean;
    }>({
        hasReachedLimit: false,
        isTeamMember: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Add a global click handler that intercepts clicks on "New Project" links
    useEffect(() => {
        const checkProjectLimits = async () => {
            try {
                setIsLoading(true);

                // Get the current user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user profile to determine if team member
                const { data: profile } = await supabase
                    .from("users")
                    .select("*, teams(*)")
                    .eq("id", user.id)
                    .single();

                const isTeamMember = profile?.account_type === "team_member";
                const teamId = profile?.team_id;

                // Build query to count projects
                let query = supabase.from("projects").select("*", { count: "exact" });

                if (isTeamMember && teamId) {
                    query = query.eq("team_id", teamId);
                } else {
                    query = query.eq("owner_id", user.id);
                }

                const { count, error } = await query;

                if (error) throw error;

                const projectLimit = isTeamMember ? 2 : 1;
                const hasReachedLimit = (count !== null && count >= projectLimit);

                setProjectLimits({
                    hasReachedLimit,
                    isTeamMember
                });
            } catch (error) {
                console.error("Error checking project limits:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkProjectLimits();

        // Add click handler to intercept new project links
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link?.href && link.href.includes('/dashboard/projects/create') && projectLimits.hasReachedLimit) {
                e.preventDefault();
                e.stopPropagation();

                toast({
                    title: "Project limit reached",
                    description: projectLimits.isTeamMember
                        ? "Team accounts can create up to 2 projects"
                        : "You can create up to 1 project. Upgrade to a team account for more projects.",
                    variant: "destructive",
                });
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [supabase, toast, projectLimits]);

    return <>{children}</>;
}