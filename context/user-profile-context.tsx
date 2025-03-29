'use client';  // Essential client directive

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/supabase/database.types';

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

// Singleton pattern - moved inside the component to ensure client-only execution
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Utility functions for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
        if (!inThrottle) {
            inThrottle = true;
            lastResult = func.apply(this, args);
            setTimeout(() => (inThrottle = false), limit);
        }
        return lastResult;
    } as T;
}

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState(0);

    // Get supabase client safely inside the client component
    const getSupabase = () => {
        if (!clientInstance) {
            clientInstance = createClientComponentClient<Database>();
        }
        return clientInstance;
    };

    const supabase = getSupabase();

    // Cache key for local storage
    const PROFILE_CACHE_KEY = 'swift_tasks_user_profile';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Try to load profile from local cache first
    useEffect(() => {
        try {
            const cachedData = localStorage.getItem(PROFILE_CACHE_KEY);
            if (cachedData) {
                const { profile: cachedProfile, timestamp } = JSON.parse(cachedData);
                const now = Date.now();

                // Use cache if it's not expired
                if (now - timestamp < CACHE_TTL) {
                    setProfile(cachedProfile);
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.warn('Error reading profile from cache:', error);
        }
    }, []);

    // Implement throttled fetching
    const fetchProfile = useCallback(throttle(async () => {
        // Don't fetch if we fetched recently (2 seconds)
        const now = Date.now();
        if (now - lastFetchTime < 2000) {
            return;
        }

        try {
            setIsLoading(true);
            setLastFetchTime(now);

            // Get current user
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

            if (userError || !currentUser) {
                setUser(null);
                setProfile(null);
                return;
            }

            setUser(currentUser);

            // Only fetch profile if we don't have it yet or user ID changed
            if (!profile || profile.id !== currentUser.id) {
                const { data, error: profileError } = await supabase
                    .from('users')
                    .select('*, teams(*)')
                    .eq('id', currentUser.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    return;
                }

                if (data) {
                    setProfile(data);

                    // Cache profile in localStorage
                    try {
                        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
                            profile: data,
                            timestamp: Date.now()
                        }));
                    } catch (error) {
                        console.warn('Error caching profile:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        } finally {
            setIsLoading(false);
        }
    }, 2000), [profile, supabase, lastFetchTime]);

    // Initial data fetch
    useEffect(() => {
        fetchProfile();

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session) {
                    setUser(session.user);
                    fetchProfile();
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);

                // Clear cache on sign out
                try {
                    localStorage.removeItem(PROFILE_CACHE_KEY);
                } catch (error) {
                    console.warn('Error clearing profile cache:', error);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

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