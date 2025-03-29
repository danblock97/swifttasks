// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/user-profile';
import { fetchServerSession } from '@/lib/supabase/utils';
import { ClientProfileProvider } from '@/components/providers/client-profile-provider';

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    // Use the cached session check
    const sessionData = await fetchServerSession();
    const session = sessionData.data.session;

    // If no session, redirect to login - this check is now fast thanks to caching
    if (!session) {
        redirect("/login");
    }

    // Get user profile - uses our cached function
    const userProfile = await getUserProfile();

    // If user exists in Auth but not in the database yet, redirect to a loading page
    if (!userProfile) {
        redirect("/auth/setting-up-account");
    }

    return (
        // Use a client boundary component
        <ClientProfileProvider initialProfile={userProfile}>
            {children}
        </ClientProfileProvider>
    );
}