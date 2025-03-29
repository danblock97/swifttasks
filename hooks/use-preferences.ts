'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/supabase/database.types';
import { useUserProfile } from '@/context/user-profile-context';

// Define the shape of our user preferences
interface UserPreferences {
    defaultView: 'list' | 'kanban' | 'calendar';
    notificationsEnabled: boolean;
    tasksSortOrder: 'due_date' | 'priority' | 'created_at';
    [key: string]: any; // Allow for additional preferences
}

// Default preferences
const defaultPreferences: UserPreferences = {
    defaultView: 'kanban',
    notificationsEnabled: false,
    tasksSortOrder: 'created_at',
};

// Local storage key
const PREFS_STORAGE_KEY = 'user_preferences';
const PREFS_TIMESTAMP_KEY = 'user_preferences_timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// We'll create the client instance inside the hook to ensure client-only execution
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isLoaded, setIsLoaded] = useState(false);
    const [saveQueue, setSaveQueue] = useState<Record<string, any>>({});
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useUserProfile();

    // Initialize client inside the hook to ensure client-side only execution
    const getSupabase = () => {
        if (!clientInstance) {
            clientInstance = createClientComponentClient<Database>();
        }
        return clientInstance;
    };

    const supabase = getSupabase();

    // Batch saves to reduce DB writes
    const processSaveQueue = async () => {
        if (Object.keys(saveQueue).length === 0 || !user) return;

        try {
            // Get current preferences from DB first to avoid overwriting other changes
            const { data, error } = await supabase
                .from('users')
                .select('preferences')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Merge current queue with existing preferences
            const currentPrefs = data?.preferences || preferences;
            const updatedPrefs = { ...currentPrefs, ...saveQueue };

            // Save to database
            await supabase
                .from('users')
                .update({ preferences: updatedPrefs })
                .eq('id', user.id);

            // Update local state and clear queue
            setPreferences(updatedPrefs);
            setSaveQueue({});

            // Update localStorage
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updatedPrefs));
            localStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

    // Load preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                // First try localStorage for immediate response
                const storedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
                const timestamp = localStorage.getItem(PREFS_TIMESTAMP_KEY);
                const now = Date.now();

                if (storedPrefs && timestamp && now - parseInt(timestamp) < CACHE_TTL) {
                    // Use cached preferences if they're fresh
                    setPreferences(JSON.parse(storedPrefs));
                    setIsLoaded(true);
                    return;
                }

                // If not in local storage or expired, and user is logged in, fetch from DB
                if (user) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('preferences')
                        .eq('id', user.id)
                        .single();

                    if (error) throw error;

                    if (data?.preferences) {
                        // Update state with database preferences
                        setPreferences(data.preferences);

                        // Update localStorage
                        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(data.preferences));
                        localStorage.setItem(PREFS_TIMESTAMP_KEY, now.toString());
                    } else {
                        // Initialize preferences if not set
                        await supabase
                            .from('users')
                            .update({ preferences: defaultPreferences })
                            .eq('id', user.id);

                        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(defaultPreferences));
                        localStorage.setItem(PREFS_TIMESTAMP_KEY, now.toString());
                    }
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadPreferences();
    }, [user, supabase]);

    // Function to update a specific preference
    const updatePreference = async (key: keyof UserPreferences, value: any) => {
        try {
            // Immediately update local state for responsive UI
            setPreferences(prev => ({
                ...prev,
                [key]: value
            }));

            // Always update localStorage for fast access
            const updatedPreferences = { ...preferences, [key]: value };
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updatedPreferences));
            localStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());

            // Add to save queue
            setSaveQueue(prev => ({
                ...prev,
                [key]: value
            }));

            // Debounce database updates (save after 2 seconds of inactivity)
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                processSaveQueue();
                saveTimeoutRef.current = null;
            }, 2000);
        } catch (error) {
            console.error('Error updating preference:', error);
        }
    };

    // Function to reset preferences to defaults
    const resetPreferences = async () => {
        try {
            // Reset local state
            setPreferences(defaultPreferences);

            // Update localStorage
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(defaultPreferences));
            localStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());

            // Clear any pending saves
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }

            setSaveQueue({});

            // Update database if logged in
            if (user) {
                await supabase
                    .from('users')
                    .update({ preferences: defaultPreferences })
                    .eq('id', user.id);
            }
        } catch (error) {
            console.error('Error resetting preferences:', error);
        }
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Save any pending changes before unmounting
            if (Object.keys(saveQueue).length > 0) {
                processSaveQueue();
            }
        };
    }, [saveQueue]);

    return { preferences, updatePreference, resetPreferences, isLoaded };
}