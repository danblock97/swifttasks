import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isLoaded, setIsLoaded] = useState(false);
    const supabase = createClientComponentClient();

    // Load preferences from localStorage first, for immediate UI response
    useEffect(() => {
        const loadLocalPreferences = () => {
            try {
                const storedPrefs = localStorage.getItem('user_preferences');
                if (storedPrefs) {
                    const parsedPrefs = JSON.parse(storedPrefs);
                    setPreferences(parsedPrefs);
                }
            } catch (e) {
                console.error('Error parsing stored preferences:', e);
                // If there's an error, use default preferences
                setPreferences(defaultPreferences);
            } finally {
                setIsLoaded(true);
            }
        };

        loadLocalPreferences();
    }, []);

    // Then try to load from database if user is authenticated
    useEffect(() => {
        const loadDatabasePreferences = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // No authenticated user, rely on localStorage only
                    return;
                }

                // Get user profile with preferences
                const { data, error } = await supabase
                    .from('users')
                    .select('preferences')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.warn('Error fetching user preferences:', error.message);
                    return;
                }

                if (data && data.preferences) {
                    // Update state with database preferences
                    setPreferences(data.preferences);
                    // Also update localStorage for offline/fast access
                    localStorage.setItem('user_preferences', JSON.stringify(data.preferences));
                } else if (!data.preferences) {
                    // User exists but has no preferences yet, initialize them
                    try {
                        await supabase
                            .from('users')
                            .update({ preferences: defaultPreferences })
                            .eq('id', user.id);
                    } catch (updateError) {
                        console.warn('Could not save default preferences:', updateError);
                    }
                }
            } catch (error) {
                console.warn('Error loading database preferences:', error);
                // Non-critical error, just continue with localStorage preferences
            }
        };

        if (isLoaded) {
            // Don't block the UI, load database prefs in the background
            loadDatabasePreferences();
        }
    }, [isLoaded, supabase]);

    // Function to update a specific preference
    const updatePreference = async (key: keyof UserPreferences, value: any) => {
        try {
            // Update local state
            const updatedPreferences = { ...preferences, [key]: value };
            setPreferences(updatedPreferences);

            // Update localStorage
            localStorage.setItem('user_preferences', JSON.stringify(updatedPreferences));

            // Try to update database if user is authenticated
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ preferences: updatedPreferences })
                        .eq('id', user.id);

                    if (error) {
                        console.warn('Could not save preference to database:', error.message);
                    }
                } catch (dbError) {
                    console.warn('Database error saving preference:', dbError);
                    // Non-critical error, localStorage is already updated
                }
            }
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
            localStorage.setItem('user_preferences', JSON.stringify(defaultPreferences));

            // Try to update database if user is authenticated
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    await supabase
                        .from('users')
                        .update({ preferences: defaultPreferences })
                        .eq('id', user.id);
                }
            } catch (dbError) {
                console.warn('Could not reset preferences in database:', dbError);
                // Non-critical error, localStorage is already updated
            }
        } catch (error) {
            console.error('Error resetting preferences:', error);
        }
    };

    return { preferences, updatePreference, resetPreferences, isLoaded };
}