// app/api/team-invite/process-content-migration/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface ContentCounts {
    projects: number;
    spaces: number;
    todoLists: number;
}

export async function POST(request: NextRequest) {
    try {
        const { teamId, inviteCode } = await request.json();

        if (!teamId || !inviteCode) {
            return NextResponse.json(
                { error: 'Missing team ID or invite code' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verify the user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Verify the invitation exists and is valid
        const { data: invite, error: inviteError } = await supabase
            .from('team_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation' },
                { status: 400 }
            );
        }

        // Verify the user's email matches the invitation
        if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
            return NextResponse.json(
                { error: 'This invitation is for a different email address' },
                { status: 403 }
            );
        }

        // Check user content counts
        const [
            { count: projectsCount },
            { count: spacesCount },
            { count: todoListsCount }
        ] = await Promise.all([
            supabase
                .from("projects")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
                .is("team_id", null),
            supabase
                .from("doc_spaces")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
                .is("team_id", null),
            supabase
                .from("todo_lists")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", userId)
        ]);

        const contentCounts: ContentCounts = {
            projects: projectsCount || 0,
            spaces: spacesCount || 0,
            todoLists: todoListsCount || 0
        };

        // If there's personal content, return the counts so the client can show a warning
        if (contentCounts.projects > 0 || contentCounts.spaces > 0) {
            return NextResponse.json({
                hasContent: true,
                contentCounts,
                teamId,
                inviteCode
            });
        }

        // If no personal content, process migration directly
        await migrateAndJoinTeam(supabase, userId, teamId, inviteCode);

        return NextResponse.json({
            success: true,
            hasContent: false,
            message: 'Joined team successfully'
        });
    } catch (error: any) {
        console.error('Error processing content migration:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process team join' },
            { status: 500 }
        );
    }
}

// Separate PUT endpoint to confirm migration after user has seen warning
export async function PUT(request: NextRequest) {
    try {
        const { teamId, inviteCode, confirmMigration } = await request.json();

        if (!teamId || !inviteCode || !confirmMigration) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verify the user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Process the migration
        await migrateAndJoinTeam(supabase, userId, teamId, inviteCode);

        return NextResponse.json({
            success: true,
            message: 'Joined team successfully'
        });
    } catch (error: any) {
        console.error('Error confirming content migration:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process team join' },
            { status: 500 }
        );
    }
}

// Shared function to handle content migration and team joining
async function migrateAndJoinTeam(supabase: any, userId: string, teamId: string, inviteCode: string) {
    // First get all the user's personal projects
    const { data: projectsData } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", userId)
        .is("team_id", null);

    if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map((p: any) => p.id);

        // Get all board IDs for these projects
        const { data: boardsData } = await supabase
            .from("boards")
            .select("id")
            .in("project_id", projectIds);

        if (boardsData && boardsData.length > 0) {
            const boardIds = boardsData.map((b: any) => b.id);

            // Get all column IDs for these boards
            const { data: columnsData } = await supabase
                .from("board_columns")
                .select("id")
                .in("board_id", boardIds);

            if (columnsData && columnsData.length > 0) {
                const columnIds = columnsData.map((c: any) => c.id);

                // Delete all board items that belong to these columns
                await supabase
                    .from("board_items")
                    .delete()
                    .in("column_id", columnIds);
            }

            // Delete all columns that belong to these boards
            await supabase
                .from("board_columns")
                .delete()
                .in("board_id", boardIds);

            // Delete all boards
            await supabase
                .from("boards")
                .delete()
                .in("id", boardIds);
        }

        // Now delete the projects themselves
        await supabase
            .from("projects")
            .delete()
            .in("id", projectIds);
    }

    // Get all the user's personal doc spaces
    const { data: spacesData } = await supabase
        .from("doc_spaces")
        .select("id")
        .eq("owner_id", userId)
        .is("team_id", null);

    if (spacesData && spacesData.length > 0) {
        const spaceIds = spacesData.map((s: any) => s.id);

        // Delete all doc pages that belong to these spaces
        await supabase
            .from("doc_pages")
            .delete()
            .in("space_id", spaceIds);

        // Delete the spaces themselves
        await supabase
            .from("doc_spaces")
            .delete()
            .in("id", spaceIds);
    }

    // Update user to join team
    await supabase
        .from("users")
        .update({
            account_type: "team_member",
            team_id: teamId,
            is_team_owner: false
        })
        .eq("id", userId);

    // Delete invitation
    await supabase
        .from("team_invites")
        .delete()
        .eq("invite_code", inviteCode);

    // Also try to delete any notifications related to this invitation
    try {
        await supabase
            .from("user_notifications")
            .delete()
            .eq("type", "team_invitation")
            .like("data->invite_code", inviteCode);
    } catch (error) {
        console.warn("Failed to delete notifications:", error);
        // Continue anyway as this is not critical
    }

    return true;
}