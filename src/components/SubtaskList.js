import React, { useState } from "react";
import SubtaskModal from "./SubtaskModal";
import { toast } from "react-toastify";
import { supabase } from "../lib/supabaseClient";

const SubtaskList = ({
	taskId,
	fetchTasks,
	fetchSubtasks,
	subtasks,
	setSubtasks,
}) => {
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const [selectedSubtask, setSelectedSubtask] = useState(null);

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

	return (
		<div>
			<ul>
				{subtasks.map((subtask) => (
					<li key={subtask.id} className="mb-4">
						<div className="p-4 border rounded-lg shadow-md hover:shadow-lg mt-4 transition-shadow bg-white dark:bg-gray-800 flex flex-col md:flex-row">
							<div
								className={`w-2 h-auto md:h-full mb-4 md:mb-0 md:mr-4 ${
									subtask.priority === "low"
										? "bg-green-500"
										: subtask.priority === "medium"
										? "bg-orange-500"
										: "bg-red-500"
								}`}
							></div>
							<div className="flex-1">
								<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
									<p className="font-semibold text-lg">{subtask.title}</p>
									<div className="flex mt-2 md:mt-0">
										<button
											onClick={() => handleEditSubtask(subtask)}
											className="text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500 mr-2"
										>
											Edit
										</button>
										<button
											onClick={() => deleteSubtask(subtask.id)}
											className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-500"
										>
											Delete
										</button>
									</div>
								</div>
								<p className="text-gray-600 dark:text-gray-400 mb-1">
									{subtask.description}
								</p>
								<div className="text-sm text-gray-500 dark:text-gray-400">
									<p>Due Date: {subtask.due_date}</p>
									<p>Priority: {subtask.priority}</p>
									<p>Status: {subtask.status}</p>
								</div>
							</div>
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
