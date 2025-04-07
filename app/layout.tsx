import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteNavbar } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/ui/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CookieConsentBanner } from "@/components/cookie-consent";
import { NavigationLoadingProvider } from "@/components/providers/navigation-loading-provider";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SwiftTasks - Streamlined Task Management",
	description:
		"Manage your tasks, projects, and documentation efficiently with SwiftTasks",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<NavigationLoadingProvider>
					<ThemeProvider>
						<div className="flex flex-col min-h-screen">
							<SiteNavbar />
							<LoadingIndicator />
							<main className="flex-1">{children}</main>
							<SiteFooter />
							<CookieConsentBanner />
						</div>
						<Toaster />
					</ThemeProvider>
				</NavigationLoadingProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
