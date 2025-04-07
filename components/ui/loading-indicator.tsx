"use client";

import { useNavigationLoading } from "@/components/providers/navigation-loading-provider";
import { cn } from "@/lib/utils";

export function LoadingIndicator() {
	const { isLoading } = useNavigationLoading();

	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-card backdrop-blur-sm">
			<div className="text-center">
				<div className="flex items-center justify-center space-x-2 mb-2">
					{[0, 1, 2].map((dot) => (
						<div
							key={dot}
							className={cn(
								"w-10 h-10 rounded-full bg-blue-500",
								"animate-bounce",
								dot === 0 && "animation-delay-0",
								dot === 1 && "animation-delay-150",
								dot === 2 && "animation-delay-300"
							)}
						/>
					))}
				</div>
				<p className="text-2xl text-muted-foreground">Loading...</p>
			</div>
		</div>
	);
}
