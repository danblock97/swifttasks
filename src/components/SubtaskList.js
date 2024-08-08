import React, { useState, useEffect } from "react";
import SubtaskModal from "./SubtaskModal";

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
			<ul>
				{subtasks.map((subtask) => (
					<li key={subtask.id} className="mb-4 mt-4">
						<div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
							<div className="flex justify-between items-center mb-2">
								<p className="font-semibold text-lg">{subtask.title}</p>
								<button
									onClick={() => handleEditSubtask(subtask)}
									className="text-blue-500 hover:text-blue-700"
								>
									Edit
								</button>
							</div>
							<p className="text-gray-600 mb-1">{subtask.description}</p>
							<div className="text-sm text-gray-500">
								<p>Due Date: {subtask.due_date}</p>
								<p>Priority: {subtask.priority}</p>
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
