// app/(dashboard)/layout.tsx
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { DocsDashboardWrapper } from "@/components/dashboard/docs-dashboard-wrapper";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/user-profile';
import { UserProfileProvider } from '@/context/user-profile-context';

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get the user session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If no session, redirect to login
    if (!session) {
        redirect("/login");
    }

    // Get user profile - uses our new cached function
    const userProfile = await getUserProfile();

    // If user exists in Auth but not in the database yet, redirect to a loading page
    if (!userProfile) {
        redirect("/auth/setting-up-account");
    }

    return (
        // Wrap with our provider to make profile available to all client components
        <UserProfileProvider>
            <div className="flex min-h-screen flex-col">
                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:gap-10 max-w-full px-2">
                    <Sidebar user={userProfile} className="hidden md:block" />
                    <main className="flex w-full flex-col overflow-hidden p-2 md:px-4 lg:px-6">
                        <DashboardWrapper>
                            <DocsDashboardWrapper>
                                {children}
                            </DocsDashboardWrapper>
                        </DashboardWrapper>
                    </main>
                </div>
            </div>
        </UserProfileProvider>
    );
}