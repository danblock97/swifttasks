// File: context/user-profile-context.tsx
"use client"; // Essential client directive

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database, DbUser } from "@/lib/supabase/database.types"; // Import DbUser if needed for comparison, or just Database

// Define Team type based on DbTeam (or keep simple if only name/id needed)
interface Team {
	id: string;
	name: string;
	owner_id: string;
	created_at: string;
}

// Corrected UserProfile interface to match DbUser nullability
interface UserProfile {
	id: string;
	email: string; // Assuming email is always present from auth user
	display_name: string | null; // Corrected: Allow null
	avatar_url?: string | null; // Added avatar_url based on DbUser
	account_type: "single" | "team_member" | null; // Corrected: Allow null
	team_id: string | null;
	is_team_owner: boolean | null; // Corrected: Allow null
	preferences?: DbUser["preferences"]; // Use the type from database.types.ts
	teams: Team | null; // Keep as is, assuming 'teams(*)' fetches this structure
}

interface UserProfileContextType {
	user: User | null;
	profile: UserProfile | null;
	isLoading: boolean;
	refreshProfile: () => Promise<void>; // Function to manually refresh
}

// Create context with default values
const UserProfileContext = createContext<UserProfileContextType>({
	user: null,
	profile: null,
	isLoading: true,
	refreshProfile: async () => {},
});

// Singleton pattern - moved inside the component
let clientInstance: ReturnType<
	typeof createClientComponentClient<Database>
> | null = null;

// Utility function for throttling (keep as is)
function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): T {
	/* ... implementation ... */
	let inThrottle: boolean;
	let lastResult: ReturnType<T>;
	return function (this: any, ...args: Parameters<T>): ReturnType<T> {
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
	// State uses the corrected UserProfile type
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [lastFetchTime, setLastFetchTime] = useState(0);

	// Get supabase client safely
	const getSupabase = useCallback(() => {
		if (!clientInstance) {
			clientInstance = createClientComponentClient<Database>();
		}
		return clientInstance;
	}, []); // useCallback ensures stable reference

	const supabase = getSupabase();

	const PROFILE_CACHE_KEY = "swift_tasks_user_profile";
	const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	// Try to load profile from local cache first
	useEffect(() => {
		try {
			const cachedData = localStorage.getItem(PROFILE_CACHE_KEY);
			if (cachedData) {
				const { profile: cachedProfile, timestamp } = JSON.parse(cachedData);
				if (Date.now() - timestamp < CACHE_TTL) {
					// Ensure cached data conforms to UserProfile type before setting
					// Basic check, could be more thorough
					if (cachedProfile && typeof cachedProfile.id === "string") {
						setProfile(cachedProfile as UserProfile); // Cast if confident, or validate
						setIsLoading(false); // Set loading false if using cache
					} else {
						localStorage.removeItem(PROFILE_CACHE_KEY); // Remove invalid cache
					}
				} else {
					localStorage.removeItem(PROFILE_CACHE_KEY); // Remove expired cache
				}
			}
		} catch (error) {
			console.warn("Error reading profile from cache:", error);
			localStorage.removeItem(PROFILE_CACHE_KEY);
		}
	}, []);

	// Implement throttled fetching
	const fetchProfile = useCallback(
		throttle(async () => {
			const now = Date.now();
			// Throttle check
			if (now - lastFetchTime < 2000 && profile) {
				// Also check if profile exists to avoid unnecessary fetches on fast refreshes
				setIsLoading(false); // Ensure loading is false if throttled
				return;
			}

			try {
				setIsLoading(true); // Set loading true at start of actual fetch attempt
				setLastFetchTime(now);

				const {
					data: { user: currentUser },
					error: userError,
				} = await supabase.auth.getUser();

				if (userError || !currentUser) {
					setUser(null);
					setProfile(null);
					localStorage.removeItem(PROFILE_CACHE_KEY); // Clear cache on error/no user
					console.log("No user session found.");
					return;
				}

				// Set user only if different
				setUser((current) =>
					current?.id === currentUser.id ? current : currentUser
				);

				// Fetch profile data from DB
				// Note: Select specific fields matching UserProfile for better type safety if possible
				const { data, error: profileError } = await supabase
					.from("users")
					.select("*, teams(*)") // Select needed fields + related team
					.eq("id", currentUser.id)
					.single();

				if (profileError) {
					console.error("Error fetching profile:", profileError);
					// Don't clear profile here if fetch fails, might have cached version
					return;
				}

				if (data) {
					// Data fetched from DB should match UserProfile type now
					const userProfileData = data as UserProfile; // Cast or validate if needed
					setProfile(userProfileData);

					// Cache profile in localStorage
					try {
						localStorage.setItem(
							PROFILE_CACHE_KEY,
							JSON.stringify({
								profile: userProfileData,
								timestamp: Date.now(),
							})
						);
					} catch (error) {
						console.warn("Error caching profile:", error);
					}
				} else {
					// Handle case where user exists in auth but not in public.users
					console.warn(
						"User exists in auth but profile not found in public.users"
					);
					setProfile(null);
					localStorage.removeItem(PROFILE_CACHE_KEY);
				}
			} catch (error) {
				console.error("Error in fetchProfile:", error);
			} finally {
				setIsLoading(false);
			}
		}, 2000),
		[supabase, lastFetchTime, profile]
	);

	useEffect(() => {
		if (!profile) {
			fetchProfile();
		}

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			console.log("Auth event:", event);
			if (
				event === "SIGNED_IN" ||
				event === "TOKEN_REFRESHED" ||
				event === "USER_UPDATED"
			) {
				if (session) {
					setUser(session.user);

					fetchProfile();
				} else {
					setUser(null);
					setProfile(null);
					localStorage.removeItem(PROFILE_CACHE_KEY);
				}
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				setProfile(null);
				localStorage.removeItem(PROFILE_CACHE_KEY);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase, profile]);

	return (
		<UserProfileContext.Provider
			value={{ user, profile, isLoading, refreshProfile: fetchProfile }}
		>
			{children}
		</UserProfileContext.Provider>
	);
}

// Custom hook to use the context
export const useUserProfile = () => useContext(UserProfileContext);
