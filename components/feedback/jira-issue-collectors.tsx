"use client";

import { useEffect, useRef } from "react";
import $ from "jquery";

// Component props to receive custom trigger IDs
interface JiraIssueCollectorsProps {
	bugReportTriggerId?: string;
	featureRequestTriggerId?: string;
}

export function JiraIssueCollectors({
	bugReportTriggerId = "reportBugTrigger",
	featureRequestTriggerId = "requestFeatureTrigger",
}: JiraIssueCollectorsProps) {
	const scriptLoadedRef = useRef(false);
	const bugAttachedRef = useRef(false);
	const featureAttachedRef = useRef(false);

	useEffect(() => {
		// Make jQuery available globally for the Jira collector script
		if (typeof window !== "undefined") {
			window.jQuery = $;
			window.$ = $;
			console.log("jQuery exposed globally:", !!window.jQuery);
		}

		// Only load the script once
		if (scriptLoadedRef.current) return;

		// Track if we're loading the script
		let loading = false;

		// Check if jQuery is available
		if (typeof window === "undefined" || !$) return;

		// Function to handle manual clicks on our trigger elements
		const handleBugClick = (e: MouseEvent) => {
			e.preventDefault();
			if (typeof window.jQuery !== "undefined") {
				// Directly invoke the Jira issue collector for bugs
				console.log(
					"Bug report button clicked, trying to invoke Jira collector"
				);
				try {
					// Check if Jira collector has created these elements
					if (window.jQuery(".atlwdg-trigger.atlwdg-Bug").length) {
						window.jQuery(".atlwdg-trigger.atlwdg-Bug").click();
						console.log("Clicked on Jira bug collector trigger element");
					} else {
						console.warn("Jira bug collector trigger element not found");
					}
				} catch (err) {
					console.error("Error invoking Jira bug collector:", err);
				}
			} else {
				console.error("jQuery not available");
			}
		};

		const handleFeatureClick = (e: MouseEvent) => {
			e.preventDefault();
			if (typeof window.jQuery !== "undefined") {
				// Directly invoke the Jira issue collector for features
				console.log(
					"Feature request button clicked, trying to invoke Jira collector"
				);
				try {
					// Check if Jira collector has created these elements
					if (window.jQuery(".atlwdg-trigger.atlwdg-FEATURE").length) {
						window.jQuery(".atlwdg-trigger.atlwdg-FEATURE").click();
						console.log("Clicked on Jira feature collector trigger element");
					} else {
						console.warn("Jira feature collector trigger element not found");
					}
				} catch (err) {
					console.error("Error invoking Jira feature collector:", err);
				}
			} else {
				console.error("jQuery not available");
			}
		};

		// Load the Jira collector script
		if (!scriptLoadedRef.current && !loading) {
			loading = true;
			console.log("Loading Jira collector script");

			// Set up the collector config before script loads
			window.ATL_JQ_PAGE_PROPS = {
				triggerFunction: function (showCollectorDialog: Function) {
					// Define trigger for the bug report button
					window
						.jQuery("#" + bugReportTriggerId)
						.click(function (e: JQuery.ClickEvent) {
							e.preventDefault();
							showCollectorDialog();
						});

					// Define trigger for the feature request button
					window
						.jQuery("#" + featureRequestTriggerId)
						.click(function (e: JQuery.ClickEvent) {
							e.preventDefault();
							showCollectorDialog();
						});
				},
			};

			// Create a custom element for the collector script
			const script = document.createElement("script");
			script.src =
				"https://danblock1997.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/xghl7j/b/9/b0105d975e9e59f24a3230a22972a71a/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-GB&collectorId=e046668e";
			script.async = true;

			// Handle script load completion
			script.onload = () => {
				console.log("Jira collector script loaded");
				scriptLoadedRef.current = true;
				loading = false;
			};

			script.onerror = () => {
				console.error("Failed to load Jira collector script");
				loading = false;
			};

			// Add script to the document
			document.body.appendChild(script);
		}

		// Attach click handlers directly using DOM methods as a fallback
		const bugButton = document.getElementById(bugReportTriggerId);
		const featureButton = document.getElementById(featureRequestTriggerId);

		if (bugButton && !bugAttachedRef.current) {
			bugButton.addEventListener("click", handleBugClick as EventListener);
			bugAttachedRef.current = true;
			console.log("Attached click handler to bug report button");
		}

		if (featureButton && !featureAttachedRef.current) {
			featureButton.addEventListener(
				"click",
				handleFeatureClick as EventListener
			);
			featureAttachedRef.current = true;
			console.log("Attached click handler to feature request button");
		}

		// Clean up function
		return () => {
			const bugButton = document.getElementById(bugReportTriggerId);
			const featureButton = document.getElementById(featureRequestTriggerId);

			if (bugButton) {
				bugButton.removeEventListener("click", handleBugClick as EventListener);
			}

			if (featureButton) {
				featureButton.removeEventListener(
					"click",
					handleFeatureClick as EventListener
				);
			}
		};
	}, [bugReportTriggerId, featureRequestTriggerId]);

	// This component doesn't render anything visible
	return null;
}

// Declare the global window type to include our custom properties
declare global {
	interface Window {
		ATL_JQ_PAGE_PROPS: any;
		jQuery: any;
		$: any;
	}
}
