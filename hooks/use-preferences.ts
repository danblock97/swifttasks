"use client";

import { useState, useEffect } from 'react';
import { setUserPreferences, getUserPreferences } from '@/lib/cookies';

interface UserPreferences {
    defaultView: 'list' | 'kanban' | 'calendar';
    notificationsEnabled: boolean;
    tasksSortOrder: 'due_date' | 'priority' | 'created_at';
}

const defaultPreferences: UserPreferences = {
    defaultView: 'list',
    notificationsEnabled: true,
    tasksSortOrder: 'due_date',
};

export const useUserPreferences = () => {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preferences from cookies on mount
    useEffect(() => {
        const savedPreferences = getUserPreferences<UserPreferences>();
        if (savedPreferences) {
            setPreferences({ ...defaultPreferences, ...savedPreferences });
        }
        setIsLoaded(true);
    }, []);

    // Save preferences to cookies whenever they change
    useEffect(() => {
        if (isLoaded) {
            setUserPreferences(preferences);

            // Apply the preferences where needed
            applyPreferences(preferences);
        }
    }, [preferences, isLoaded]);

    // Apply specific preferences that need immediate effect
    const applyPreferences = (prefs: UserPreferences) => {
        // For default view and sort order, these are usually applied when viewing
        // tasks or projects, not here in the settings

        // For notifications, we handle this in the settings page directly
    };

    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetPreferences = () => {
        setPreferences(defaultPreferences);
    };

    return {
        preferences,
        updatePreference,
        resetPreferences,
        isLoaded
    };
};