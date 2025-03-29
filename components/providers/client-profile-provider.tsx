'use client';

import { UserProfileProvider } from '@/context/user-profile-context';
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { DocsDashboardWrapper } from "@/components/dashboard/docs-dashboard-wrapper";

// This is a client component wrapper that uses the UserProfileProvider
export function ClientProfileProvider({
                                          children,
                                          initialProfile
                                      }: {
    children: React.ReactNode;
    initialProfile: any;
}) {
    return (
        <UserProfileProvider>
            <div className="flex min-h-screen flex-col">
                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:gap-10 max-w-full px-2">
                    <Sidebar user={initialProfile} className="hidden md:block" />
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