// contexts/user-profile-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

// Type definitions for user profile and team
interface Team {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
}

interface UserProfile {
    id: string;
    email: string;
    display_name: string;
    account_type: 'single' | 'team_member';
    team_id: string | null;
    is_team_owner: boolean;
    teams: Team | null;
}

interface UserProfileContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
}

// Create context with default values
const UserProfileContext = createContext<UserProfileContextType>({
    user: null,
    profile: null,
    isLoading: true,
    refreshProfile: async () => {},
});

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();

    const fetchProfile = async () => {
        try {
            // Get user session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setUser(null);
                setProfile(null);
                setIsLoading(false);
                return;
            }

            setUser(session.user);

            // Get user profile with team data
            const { data: userProfile } = await supabase
                .from('users')
                .select('*, teams(*)')
                .eq('id', session.user.id)
                .single();

            setProfile(userProfile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchProfile();

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user);
                fetchProfile();
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserProfileContext.Provider
            value={{
                user,
                profile,
                isLoading,
                refreshProfile: fetchProfile
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
}

// Custom hook to use the context
export const useUserProfile = () => useContext(UserProfileContext);