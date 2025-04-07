"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
	Database,
	Json,
	CalendarReminderPreferences,
	DbUser,
} from "@/lib/supabase/database.types";
import { useUserProfile } from "@/context/user-profile-context";

interface UserPreferences {
	darkMode?: boolean;
	notificationsEnabled?: boolean;
	defaultView?: "list" | "kanban" | "calendar";
	tasksSortOrder?: "due_date" | "priority" | "created_at";
	calendar_reminders?: CalendarReminderPreferences;
}

// Default preferences - ensure structure matches the interface
const defaultPreferences: UserPreferences = {
	darkMode: false,
	notificationsEnabled: false,
	defaultView: "kanban",
	tasksSortOrder: "created_at",
	calendar_reminders: { frequency: "none" },
};

// Local storage keys
const PREFS_STORAGE_KEY = "user_preferences";
const PREFS_TIMESTAMP_KEY = "user_preferences_timestamp";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Function to safely use localStorage
const safeLocalStorage = {
	getItem: (key: string): string | null => {
		if (typeof window === "undefined") return null;
		try {
			return localStorage.getItem(key);
		} catch (error) {
			console.warn(`Error reading ${key} from localStorage:`, error);
			return null;
		}
	},
	setItem: (key: string, value: string): boolean => {
		if (typeof window === "undefined") return false;
		try {
			localStorage.setItem(key, value);
			return true;
		} catch (error) {
			console.warn(`Error writing ${key} to localStorage:`, error);
			return false;
		}
	},
	removeItem: (key: string): boolean => {
		if (typeof window === "undefined") return false;
		try {
			localStorage.removeItem(key);
			return true;
		} catch (error) {
			console.warn(`Error removing ${key} from localStorage:`, error);
			return false;
		}
	},
};

// Client instance (singleton pattern)
let clientInstance: ReturnType<
	typeof createClientComponentClient<Database>
> | null = null;

export function useUserPreferences() {
	// Use the explicit UserPreferences type for state
	const [preferences, setPreferences] =
		useState<UserPreferences>(defaultPreferences);
	const [isLoaded, setIsLoaded] = useState(false);
	const [saveQueue, setSaveQueue] = useState<Partial<UserPreferences>>({}); // Use Partial for queue
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { user } = useUserProfile();

	// Initialize client inside the hook
	const getSupabase = useCallback(() => {
		// Wrap in useCallback
		if (!clientInstance) {
			clientInstance = createClientComponentClient<Database>();
		}
		return clientInstance;
	}, []);

	const supabase = getSupabase();

	// Batch saves to reduce DB writes
	const processSaveQueue = useCallback(async () => {
		// Wrap in useCallback
		if (Object.keys(saveQueue).length === 0 || !user || !supabase) return;

		// Clear timeout ref since we are processing now
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}

		try {
			// Fetch current preferences directly from DB to ensure atomicity
			const { data: currentData, error: fetchError } = await supabase
				.from("users")
				.select("preferences")
				.eq("id", user.id)
				.single();

			// Handle potential null preferences or fetch errors gracefully
			if (fetchError && fetchError.code !== "PGRST116") {
				// Ignore 'not found' error
				console.error(
					"Error fetching current preferences before save:",
					fetchError
				);
				// Optionally clear queue or retry later? For now, just log and return.
				return;
			}

			// Merge queued changes onto the latest DB state (or local state if DB fetch failed/was null)
			const basePrefs =
				(currentData?.preferences as UserPreferences) ??
				preferences ??
				defaultPreferences;
			const updatedPrefs = { ...basePrefs, ...saveQueue };

			// --- Type Assertion for Supabase Update ---
			// Assert that updatedPrefs conforms to the Json type expected by Supabase client
			const prefsToSave = updatedPrefs as unknown as Json;

			// Save merged preferences to database
			const { error: updateError } = await supabase
				.from("users")
				.update({ preferences: prefsToSave }) // Pass the asserted value
				.eq("id", user.id);

			if (updateError) {
				console.error("Error saving preferences to DB:", updateError);

				return;
			}

			setPreferences(updatedPrefs);
			setSaveQueue({});

			try {
				safeLocalStorage.setItem(
					PREFS_STORAGE_KEY,
					JSON.stringify(updatedPrefs)
				);
				safeLocalStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());
			} catch (storageError) {
				console.warn("Error saving preferences to localStorage:", storageError);
			}
		} catch (error) {
			console.error("Error processing save queue:", error);
		}
		// Add dependencies for useCallback
	}, [saveQueue, user, supabase, preferences]);

	useEffect(() => {
		const loadPreferences = async () => {
			setIsLoaded(false);
			let loadedFromCache = false;
			try {
				// Try localStorage first
				const storedPrefs = safeLocalStorage.getItem(PREFS_STORAGE_KEY);
				const timestamp = safeLocalStorage.getItem(PREFS_TIMESTAMP_KEY);
				if (
					storedPrefs &&
					timestamp &&
					Date.now() - parseInt(timestamp) < CACHE_TTL
				) {
					setPreferences(JSON.parse(storedPrefs));
					loadedFromCache = true;
				} else {
					// Clear expired cache
					safeLocalStorage.removeItem(PREFS_STORAGE_KEY);
					safeLocalStorage.removeItem(PREFS_TIMESTAMP_KEY);
				}
			} catch (error) {
				console.warn("Error loading preferences from cache:", error);
			}

			if (user && !loadedFromCache) {
				try {
					const { data, error } = await supabase
						.from("users")
						.select("preferences")
						.eq("id", user.id)
						.single();

					if (error && error.code !== "PGRST116") throw error;

					const dbPrefs = data?.preferences as UserPreferences | null;

					if (dbPrefs) {
						const mergedPrefs = { ...defaultPreferences, ...dbPrefs };
						setPreferences(mergedPrefs);
						safeLocalStorage.setItem(
							PREFS_STORAGE_KEY,
							JSON.stringify(mergedPrefs)
						);
						safeLocalStorage.setItem(
							PREFS_TIMESTAMP_KEY,
							Date.now().toString()
						);
					} else if (!loadedFromCache) {
						setPreferences(defaultPreferences);
						safeLocalStorage.setItem(
							PREFS_STORAGE_KEY,
							JSON.stringify(defaultPreferences)
						);
						safeLocalStorage.setItem(
							PREFS_TIMESTAMP_KEY,
							Date.now().toString()
						);
						await supabase
							.from("users")
							.update({ preferences: defaultPreferences as unknown as Json })
							.eq("id", user.id);
					}
				} catch (error) {
					console.error("Error loading preferences from DB:", error);
					if (!loadedFromCache) {
						setPreferences(defaultPreferences);
					}
				}
			} else if (!user && !loadedFromCache) {
				// No user and no cache, use defaults
				setPreferences(defaultPreferences);
			}
			setIsLoaded(true); // Loading finished
		};

		loadPreferences();
	}, [user, supabase]);

	// Function to update a specific preference
	const updatePreference = useCallback(
		(key: keyof UserPreferences, value: any) => {
			const newPrefs = { ...preferences, [key]: value };
			setPreferences(newPrefs);

			// Update localStorage immediately
			try {
				safeLocalStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(newPrefs));
				safeLocalStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());
			} catch (storageError) {
				console.warn(
					"Error saving preferences to localStorage during update:",
					storageError
				);
			}

			// Add change to the save queue
			setSaveQueue((prev) => ({ ...prev, [key]: value }));

			// Debounce database updates
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
			saveTimeoutRef.current = setTimeout(() => {
				processSaveQueue();
				saveTimeoutRef.current = null;
			}, 2000);
		},
		[preferences, processSaveQueue]
	);

	// Function to reset preferences to defaults
	const resetPreferences = useCallback(async () => {
		try {
			setPreferences(defaultPreferences);

			safeLocalStorage.setItem(
				PREFS_STORAGE_KEY,
				JSON.stringify(defaultPreferences)
			);
			safeLocalStorage.setItem(PREFS_TIMESTAMP_KEY, Date.now().toString());

			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
				saveTimeoutRef.current = null;
			}
			setSaveQueue({});

			// Update database if logged in
			if (user && supabase) {
				const { error } = await supabase
					.from("users")
					.update({ preferences: defaultPreferences as unknown as Json })
					.eq("id", user.id);
				if (error) {
					console.error("Error resetting preferences in DB:", error);
				}
			}
		} catch (error) {
			console.error("Error resetting preferences:", error);
		}
	}, [user, supabase]);

	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	return { preferences, updatePreference, resetPreferences, isLoaded };
}
