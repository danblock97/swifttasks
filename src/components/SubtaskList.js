import React, { useState, useEffect } from "react";
import SubtaskModal from "./SubtaskModal";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

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
		await fetchSubtasks(); // Refresh the subtask list after closing the modal
		fetchTasks(); // Also refresh the task list
	};

	useEffect(() => {
		fetchSubtasks();
	}, [fetchSubtasks]);

	return (
		<div>
			<h3 className="text-xl font-bold mb-4">Subtasks</h3>
			<ul>
				{subtasks.map((subtask) => (
					<li key={subtask.id} className="mb-4">
						<div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
							<div className="flex justify-between items-center mb-2">
								<p className="font-semibold text-lg">{subtask.title}</p>
								<div className="flex items-center">
									<button
										onClick={() => handleEditSubtask(subtask)}
										className="text-blue-500 hover:text-blue-700 mr-2"
									>
										Edit
									</button>
									<button
										onClick={() => deleteSubtask(subtask.id)}
										className="text-red-500 hover:text-red-700"
									>
										Delete
									</button>
								</div>
							</div>
							<p className="text-gray-600 mb-1">{subtask.description}</p>
							<div className="text-sm text-gray-500">
								<p>Due Date: {subtask.due_date}</p>
								<p>Priority: {subtask.priority}</p>
								<p>Status: {subtask.status}</p>
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
