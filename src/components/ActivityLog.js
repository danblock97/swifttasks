// ActivityLog.js
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";

const ActivityLog = ({ entityType, entityId }) => {
	const [activityLogs, setActivityLogs] = useState([]);
	const [isExpanded, setIsExpanded] = useState(false); // State to manage collapse/expand

	const fetchActivityLogs = useCallback(async () => {
		const { data, error } = await supabase
			.from("activity_logs")
			.select("*")
			.eq("entity_type", entityType)
			.eq("entity_id", entityId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching activity logs:", error);
		} else {
			setActivityLogs(data);
		}
	}, [entityType, entityId]);

	useEffect(() => {
		fetchActivityLogs();
	}, [fetchActivityLogs]);

	const formatActionMessage = (log) => {
		let actionMessage = "";
		if (log.action === "updated") {
			actionMessage = `${log.field_name} changed from "${log.old_value}" to "${log.new_value}"`;
		} else if (log.action === "created") {
			actionMessage = `Created`;
		} else if (log.action === "deleted") {
			actionMessage = `Deleted`;
		}
		return actionMessage;
	};

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="mt-4">
			<button
				onClick={toggleExpand}
				className="flex items-center justify-between w-full focus:outline-none"
				aria-expanded={isExpanded}
				aria-controls={`activity-log-${entityId}`}
			>
				<h4 className="text-lg font-bold">Activity Log</h4>
				<span className="text-sm text-blue-500">
					{isExpanded ? "Hide" : "Show"}
				</span>
			</button>
			{isExpanded && (
				<ul
					className="space-y-2 mt-2"
					id={`activity-log-${entityId}`}
					role="region"
					aria-labelledby={`activity-log-heading-${entityId}`}
				>
					{activityLogs.length === 0 ? (
						<li className="text-sm text-gray-600 dark:text-gray-400">
							No activity yet.
						</li>
					) : (
						activityLogs.map((log) => (
							<li
								key={log.id}
								className="text-sm text-gray-600 dark:text-gray-400"
							>
								<p>
									<span className="font-medium">{log.user_email}</span>{" "}
									{formatActionMessage(log)}{" "}
									{formatDistanceToNow(new Date(log.created_at), {
										addSuffix: true,
									})}
								</p>
							</li>
						))
					)}
				</ul>
			)}
		</div>
	);
};

export default ActivityLog;
