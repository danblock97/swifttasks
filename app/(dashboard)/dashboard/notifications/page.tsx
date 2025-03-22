import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationsTable } from "@/components/notifications/notifications-table";

export default async function NotificationsPage() {
    const supabase = createServerComponentClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

    // Get all notifications for this user
    const { data: notifications } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Notifications"
                description="View and manage your notifications"
            />

            <div className="grid gap-6">
                <NotificationsTable notifications={notifications || []} />
            </div>
        </DashboardShell>
    );
}