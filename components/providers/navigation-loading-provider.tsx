"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Create a context to manage the loading state
export const NavigationLoadingContext = createContext({
	isLoading: false,
});

export const useNavigationLoading = () => useContext(NavigationLoadingContext);

export function NavigationLoadingProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	// This tracks navigation changes through URL changes
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const handleRouteChangeStart = () => {
			setIsLoading(true);
		};

		const handleRouteChangeComplete = () => {
			// Add a small delay before hiding the loading indicator
			// for a better user experience and to avoid flashes on quick loads
			timeoutId = setTimeout(() => {
				setIsLoading(false);
			}, 500);
		};

		// Initially trigger loading state
		handleRouteChangeStart();

		// Complete the initial loading after component mounts
		timeoutId = setTimeout(handleRouteChangeComplete, 800);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [pathname, searchParams]);

	// Custom event for handling client-side navigations not caught by URL changes
	useEffect(() => {
		const handleBeforeNavigate = () => {
			setIsLoading(true);
		};

		const handleNavigateComplete = () => {
			setIsLoading(false);
		};

		// Add event listeners for navigation events
		window.addEventListener("beforeNavigate", handleBeforeNavigate);
		window.addEventListener("navigateComplete", handleNavigateComplete);

		return () => {
			window.removeEventListener("beforeNavigate", handleBeforeNavigate);
			window.removeEventListener("navigateComplete", handleNavigateComplete);
		};
	}, []);

	return (
		<NavigationLoadingContext.Provider value={{ isLoading }}>
			{children}
		</NavigationLoadingContext.Provider>
	);
}
