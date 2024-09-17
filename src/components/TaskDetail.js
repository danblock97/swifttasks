import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import SubtaskList from "./SubtaskList";
import TaskModal from "./TaskModal";
import { toast } from "react-toastify";
import { formatStatus } from "../utils";
import SubtaskModal from "./SubtaskModal";
import ActivityLog from "./ActivityLog";

const TaskDetail = ({ task, fetchTasks }) => {
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [subtasks, setSubtasks] = useState([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const fetchSubtasks = useCallback(async () => {
		const { data, error } = await supabase
			.from("subtasks")
			.select("*")
			.eq("parent_task_id", task.id)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching subtasks:", error);
		} else {
			setSubtasks(data);
		}
	}, [task.id]);

	useEffect(() => {
		fetchSubtasks();
	}, [fetchSubtasks]);

	const handleOpenTaskModal = () => {
		setIsTaskModalOpen(true);
	};

	const handleCloseTaskModal = () => {
		setIsTaskModalOpen(false);
	};

	const handleOpenSubtaskModal = () => {
		setIsSubtaskModalOpen(true);
	};

	const handleCloseSubtaskModal = () => {
		setIsSubtaskModalOpen(false);
		fetchSubtasks();
	};

	const handleQuickCreateSubtask = async (e) => {
		if (e.key === "Enter" && newSubtaskTitle.trim() !== "") {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					toast.error("User not authenticated");
					return;
				}

				const subtaskData = {
					title: newSubtaskTitle,
					parent_task_id: task.id,
					user_id: user.id,
				};

				const { data, error } = await supabase
					.from("subtasks")
					.insert([subtaskData])
					.select("*")
					.single();

				if (error) {
					console.error("Error creating subtask:", error);
					toast.error("Error creating subtask");
				} else {
					const newSubtask = data;

					// Insert activity log
					const { error: logError } = await supabase
						.from("activity_logs")
						.insert([
							{
								entity_type: "subtask",
								entity_id: newSubtask.id,
								user_id: user.id,
								user_email: user.email,
								action: "created",
							},
						]);

					if (logError) {
						console.error("Error inserting activity log:", logError);
					}

					setNewSubtaskTitle("");
					fetchSubtasks();
					toast.success("Subtask created successfully");
				}
			} catch (error) {
				console.error("Error fetching user:", error);
				toast.error("Error fetching user");
			}
		}
	};

	const handleDeleteTask = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				console.error("User not authenticated");
				toast.error("User not authenticated");
				return;
			}

			const { error: subtaskError } = await supabase
				.from("subtasks")
				.delete()
				.eq("parent_task_id", task.id);

			const { error: taskError } = await supabase
				.from("tasks")
				.delete()
				.eq("id", task.id);

			if (subtaskError || taskError) {
				toast.error("Error deleting task or subtasks");
				console.error(
					"Error deleting task or subtasks",
					subtaskError,
					taskError
				);
			} else {
				// Record activity log for task deletion
				const { error: logError } = await supabase
					.from("activity_logs")
					.insert([
						{
							entity_type: "task",
							entity_id: task.id,
							user_id: user.id,
							user_email: user.email,
							action: "deleted",
						},
					]);

				if (logError) {
					console.error("Error inserting activity log:", logError);
				}

				toast.success("Task and subtasks deleted successfully");
				fetchTasks();
			}
		} catch (error) {
			console.error("Error deleting task or subtasks", error);
			toast.error("Error deleting task or subtasks");
		} finally {
			setIsDeleteModalOpen(false);
		}
	};

	const confirmDeleteTask = () => {
		setIsDeleteModalOpen(true);
	};

	const handleDeleteModalClose = () => {
		setIsDeleteModalOpen(false);
	};

	return (
		<div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
			<div className="p-6 flex flex-col md:flex-row text-gray-300 flex-1">
				<div className="flex flex-row space-x-4 flex-1">
					<div
						className={`w-2 ${
							task.priority === "low"
								? "bg-green-500"
								: task.priority === "medium"
								? "bg-orange-500"
								: "bg-red-500"
						}`}
					></div>
					<div className="flex-1 flex flex-col overflow-hidden">
						<h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-300">
							{task.title}
						</h3>
						<p className="text-gray-800 dark:text-gray-300 mb-2">
							{task.description}
						</p>

						<p className="text-gray-800 dark:text-gray-300 mb-2">
							<span className="font-semibold">Due Date:</span>{" "}
							<span className="font-medium">{task.due_date}</span>
						</p>

						<p className="text-gray-800 dark:text-gray-300 mb-2">
							<span className="font-semibold">Priority:</span>
							<span
								className={`font-medium ml-2 capitalize ${
									task.priority === "low"
										? "text-green-400"
										: task.priority === "medium"
										? "text-orange-400"
										: "text-red-400"
								}`}
							>
								{task.priority}
							</span>
						</p>

						<p className="text-gray-800 dark:text-gray-300 mb-2">
							<span className="font-semibold">Status:</span>{" "}
							<span className="font-medium">{formatStatus(task.status)}</span>
						</p>

						<p className="text-gray-800 dark:text-gray-300 mb-2">
							<span className="font-semibold">Categories:</span>{" "}
							{task.categories && task.categories.length > 0
								? task.categories.join(", ")
								: "None"}
						</p>

						<div className="flex justify-end space-x-2">
							<button
								onClick={handleOpenTaskModal}
								className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
							>
								Edit
							</button>
							<button
								onClick={confirmDeleteTask}
								className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								Delete
							</button>
						</div>
						<div className="mt-4 flex-1 flex flex-col overflow-hidden">
							<div className="flex items-center mb-4">
								<input
									type="text"
									value={newSubtaskTitle}
									onChange={(e) => setNewSubtaskTitle(e.target.value)}
									onKeyDown={handleQuickCreateSubtask}
									placeholder="Quick create subtask"
									className="w-full px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 focus:ring-blue-500 text-gray-300"
								/>
								<button
									onClick={handleOpenSubtaskModal}
									className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									+
								</button>
							</div>
							<div className="flex-1 overflow-y-auto">
								<SubtaskList
									taskId={task.id}
									fetchTasks={fetchTasks}
									subtasks={subtasks}
									fetchSubtasks={fetchSubtasks}
									setSubtasks={setSubtasks}
								/>
							</div>
						</div>
						{/* Include Activity Log */}
						<ActivityLog entityType="task" entityId={task.id} />
					</div>
				</div>
			</div>
			<TaskModal
				isOpen={isTaskModalOpen}
				onClose={handleCloseTaskModal}
				task={task}
				fetchTasks={fetchTasks}
			/>
			<SubtaskModal
				isOpen={isSubtaskModalOpen}
				onClose={handleCloseSubtaskModal}
				parentTaskId={task.id}
				fetchTasks={fetchTasks}
				fetchSubtasks={fetchSubtasks}
			/>
			{isDeleteModalOpen && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
					<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Delete Task</h2>
						<p>
							Deleting this task will also remove all associated subtasks. Are
							you sure you want to continue?
						</p>
						<div className="flex justify-end space-x-2 mt-4">
							<button
								onClick={handleDeleteModalClose}
								className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteTask}
								className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TaskDetail;
