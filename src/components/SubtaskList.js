import React, { useState } from "react";
import SubtaskModal from "./SubtaskModal";
import { toast } from "react-toastify";
import { supabase } from "../lib/supabaseClient";
import { formatStatus } from "../utils";
import ActivityLog from "./ActivityLog";

const SubtaskList = ({
	taskId,
	fetchTasks,
	fetchSubtasks,
	subtasks,
	setSubtasks,
}) => {
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const [selectedSubtask, setSelectedSubtask] = useState(null);
	const [expandedSubtaskId, setExpandedSubtaskId] = useState(null);

	const handleEditSubtask = (subtask) => {
		setSelectedSubtask(subtask);
		setIsSubtaskModalOpen(true);
	};

	const deleteSubtask = async (subtaskId) => {
		if (window.confirm("Are you sure you want to delete this subtask?")) {
			const { error } = await supabase
				.from("subtasks")
				.delete()
				.eq("id", subtaskId);

			if (error) {
				console.error("Error deleting subtask:", error);
				toast.error("Error deleting subtask");
			} else {
				const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
				setSubtasks(updatedSubtasks);
				toast.success("Subtask deleted successfully");
			}
		}
	};

	const handleCloseSubtaskModal = async () => {
		setSelectedSubtask(null);
		setIsSubtaskModalOpen(false);
		await fetchSubtasks();
		fetchTasks();
	};

	const toggleExpandSubtask = (subtaskId) => {
		setExpandedSubtaskId(expandedSubtaskId === subtaskId ? null : subtaskId);
	};

	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	return (
		<div className="flex-1 h-96 overflow-y-auto no-scrollbar">
			<ul className="space-y-2">
				{subtasks.map((subtask) => (
					<li key={subtask.id} className="mb-2">
						<div
							onClick={() => toggleExpandSubtask(subtask.id)}
							className="p-2 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 cursor-pointer flex flex-col"
						>
							<div className="flex justify-between items-center">
								<p className="font-semibold text-lg text-gray-800 dark:text-gray-300">
									{subtask.title}
								</p>
								<div
									className={`w-2 h-2 rounded-full ${
										subtask.priority === "low"
											? "bg-green-500"
											: subtask.priority === "medium"
											? "bg-orange-500"
											: "bg-red-500"
									}`}
								></div>
							</div>
							{expandedSubtaskId === subtask.id && (
								<div className="mt-2 flex flex-col text-gray-800 dark:text-gray-300">
									<div className="flex-1">
										<p className="mb-1">{subtask.description}</p>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											<p>Due Date: {subtask.due_date}</p>
											<p>Priority: {capitalizeFirstLetter(subtask.priority)}</p>
											<p>Status: {formatStatus(subtask.status)}</p>
											<p>
												Categories:{" "}
												{subtask.categories && subtask.categories.length > 0
													? subtask.categories.join(", ")
													: "None"}
											</p>
										</div>
									</div>
									<div className="flex mt-2">
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleEditSubtask(subtask);
											}}
											className="text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500 mr-2"
										>
											Edit
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												deleteSubtask(subtask.id);
											}}
											className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-500"
										>
											Delete
										</button>
									</div>
									<ActivityLog entityType="subtask" entityId={subtask.id} />
								</div>
							)}
						</div>
					</li>
				))}
			</ul>
			<SubtaskModal
				isOpen={isSubtaskModalOpen}
				onClose={handleCloseSubtaskModal}
				parentTaskId={taskId}
				fetchTasks={fetchTasks}
				fetchSubtasks={fetchSubtasks}
				subtask={selectedSubtask}
			/>
		</div>
	);
};

export default SubtaskList;
