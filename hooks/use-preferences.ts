"use client";

import { useState, useEffect } from 'react';
import { setUserPreferences, getUserPreferences, COOKIE_KEYS } from '@/lib/cookies';

interface UserPreferences {
    sidebarCollapsed: boolean;
    defaultView: 'list' | 'kanban' | 'calendar';
    notificationsEnabled: boolean;
    colorScheme: string;
    tasksSortOrder: 'due_date' | 'priority' | 'created_at';
}

const defaultPreferences: UserPreferences = {
    sidebarCollapsed: false,
    defaultView: 'list',
    notificationsEnabled: true,
    colorScheme: 'blue',
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
        }
    }, [preferences, isLoaded]);

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