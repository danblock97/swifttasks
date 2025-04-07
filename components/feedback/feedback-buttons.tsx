"use client";

import { Bug, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JiraIssueCollectors } from "./jira-issue-collectors";
import { useEffect, useState } from "react";

export function FeedbackButtons() {
	const [mounted, setMounted] = useState(false);

	// Only render buttons after component mounts on client
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<>
			{/* Include the Jira Issue Collectors component */}
			<JiraIssueCollectors
				bugReportTriggerId="reportBugTrigger"
				featureRequestTriggerId="requestFeatureTrigger"
			/>

			<div className="flex items-center gap-2">
				<Button
					id="reportBugTrigger"
					variant="outline"
					size="sm"
					className="flex items-center gap-1 text-xs py-1 px-2"
				>
					<Bug className="h-3 w-3" />
					<span>Report Bug</span>
				</Button>

				<Button
					id="requestFeatureTrigger"
					variant="outline"
					size="sm"
					className="flex items-center gap-1 text-xs py-1 px-2"
				>
					<Lightbulb className="h-3 w-3" />
					<span>Suggest Feature</span>
				</Button>
			</div>
		</>
	);
}
