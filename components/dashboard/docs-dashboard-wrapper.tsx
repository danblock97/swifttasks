"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";

interface DocsDashboardWrapperProps {
    children: React.ReactNode;
}

export function DocsDashboardWrapper({ children }: DocsDashboardWrapperProps) {
    const [limits, setLimits] = useState<{
        hasReachedSpaceLimit: boolean;
        isTeamSpace: boolean;
        spaceId?: string;
        hasReachedPageLimit: boolean;
    }>({
        hasReachedSpaceLimit: false,
        isTeamSpace: false,
        hasReachedPageLimit: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    // Add a global click handler that intercepts clicks on doc space or page create links
    useEffect(() => {
        const checkLimits = async () => {
            try {
                setIsLoading(true);

                // Get the current user profile
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user profile to determine if team member
                const { data: profile } = await supabase
                    .from("users")
                    .select("*, teams(*)")
                    .eq("id", user.id)
                    .single();

                const isTeamSpace = profile?.account_type === "team_member";
                const teamId = profile?.team_id;

                // Get count of doc spaces
                let query = supabase.from("doc_spaces").select("*", { count: "exact" });

                if (isTeamSpace && teamId) {
                    query = query.eq("team_id", teamId);
                } else {
                    query = query.eq("owner_id", user.id);
                }

                const { count: spaceCount, error: spaceError } = await query;

                if (spaceError) throw spaceError;

                const spaceLimit = isTeamSpace ? 2 : 1;
                const hasReachedSpaceLimit = (spaceCount !== null && spaceCount >= spaceLimit);

                // Store in state
                setLimits({
                    hasReachedSpaceLimit,
                    isTeamSpace,
                    hasReachedPageLimit: false
                });
            } catch (error) {
                console.error("Error checking documentation limits:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLimits();

        // Add click handler to intercept doc space and page creation links
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (!link?.href) return;

            // Check for doc space creation
            if (link.href.includes('/dashboard/docs/create') && limits.hasReachedSpaceLimit) {
                e.preventDefault();
                e.stopPropagation();

                toast({
                    title: "Documentation space limit reached",
                    description: limits.isTeamSpace
                        ? "Team accounts can create up to 2 documentation spaces"
                        : "You can create up to 1 documentation space. Upgrade to a team account for more spaces.",
                    variant: "destructive",
                });
                return;
            }

            // Check for page creation within a space
            if (link.href.includes('/pages/create')) {
                // Extract the space ID from the URL
                const spaceIdMatch = link.href.match(/\/docs\/([^/]+)\/pages\/create/);
                if (spaceIdMatch && spaceIdMatch[1]) {
                    const spaceId = spaceIdMatch[1];

                    // We need to check the page limit for this specific space
                    checkPageLimit(spaceId, link, e);
                }
            }
        };

        // Function to check page limits for a specific space
        const checkPageLimit = async (spaceId: string, link: HTMLAnchorElement, e: MouseEvent) => {
            try {
                // First get the space to check if it's a team space
                const { data: space } = await supabase
                    .from("doc_spaces")
                    .select("team_id")
                    .eq("id", spaceId)
                    .single();

                if (!space) return;

                const isTeamSpace = space.team_id !== null;

                // Count pages in this space
                const { count } = await supabase
                    .from("doc_pages")
                    .select("*", { count: "exact", head: true })
                    .eq("space_id", spaceId);

                const pageLimit = isTeamSpace ? 10 : 5;

                if (count !== null && count >= pageLimit) {
                    e.preventDefault();
                    e.stopPropagation();

                    toast({
                        title: "Page limit reached",
                        description: isTeamSpace
                            ? "Team documentation spaces can have up to 10 pages"
                            : "Personal documentation spaces can have up to 5 pages. Upgrade to a team account for more pages.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error checking page limits:", error);
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [supabase, toast, limits]);

    return <>{children}</>;
}