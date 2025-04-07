"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { setCookie, getCookie } from "@/lib/cookies";

export function CookieConsentBanner() {
	// State to track if user has already consented
	const [hasConsented, setHasConsented] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Check if consent was previously given
		const consentGiven = getCookie("cookie_consent");
		setHasConsented(!!consentGiven);
		setIsLoaded(true);
	}, []);

	const acceptCookies = () => {
		// Set cookie consent for 180 days
		setCookie("cookie_consent", "true", { expires: 180 });
		setHasConsented(true);

		toast({
			title: "Cookies accepted",
			description: "Your preferences have been saved.",
		});
	};

	const rejectCookies = () => {
		// Set only necessary cookies
		setCookie("cookie_consent", "false", { expires: 180 });
		setHasConsented(true);

		toast({
			title: "Only necessary cookies will be used",
			description: "Your preferences have been saved.",
		});
	};

	// Don't render anything during SSR
	if (!isLoaded) return null;

	// Don't show banner if consent was already given
	if (hasConsented) return null;

	return (
		<div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 flex justify-center backdrop-blur-sm">
			<div className="bg-card border rounded-lg shadow-lg p-4 max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex-1">
					<h3 className="font-semibold mb-1">Cookie Consent</h3>
					<p className="text-sm text-muted-foreground">
						We use cookies to enhance your browsing experience, personalize
						content and analyze traffic. By clicking "Accept," you consent to
						our use of cookies. You can read more in our{" "}
						<a href="/privacy" className="underline font-medium">
							Privacy Policy
						</a>
						.
					</p>
				</div>
				<div className="flex gap-2 flex-shrink-0">
					<Button variant="outline" size="sm" onClick={rejectCookies}>
						Reject
					</Button>
					<Button size="sm" onClick={acceptCookies}>
						Accept
					</Button>
				</div>
			</div>
		</div>
	);
}
