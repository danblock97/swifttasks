import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import SubtaskList from "./SubtaskList";
import { toast } from "react-toastify";
import SubtaskModal from "./SubtaskModal";
import { statusMapping, statusMappingReverse } from "../utils";

const TaskDetail = ({ task, fetchTasks }) => {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const [dueDate, setDueDate] = useState(task.due_date);
	const [priority, setPriority] = useState(task.priority);
	const [status, setStatus] = useState(statusMapping[task.status]);
	const [isEditing, setIsEditing] = useState(false);
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

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description);
		setDueDate(task.due_date);
		setPriority(task.priority);
		setStatus(statusMapping[task.status]);
		fetchSubtasks(); // Fetch subtasks when the task changes
	}, [task, fetchSubtasks]);

	const updateTask = async () => {
		const { error } = await supabase
			.from("tasks")
			.update({
				title,
				description,
				due_date: dueDate,
				priority,
				status: statusMappingReverse[status],
			})
			.eq("id", task.id);

		if (error) {
			console.error("Error updating task:", error);
			toast.error("Error updating task");
		} else {
			fetchTasks();
			toast.success("Task updated successfully");
			setIsEditing(false);
		}
	};

	const handleOpenSubtaskModal = () => {
		setIsSubtaskModalOpen(true);
	};

	const handleCloseSubtaskModal = () => {
		setIsSubtaskModalOpen(false);
		fetchSubtasks(); // Fetch subtasks when the modal closes
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

				const { error } = await supabase.from("subtasks").insert([subtaskData]);

				if (error) {
					console.error("Error creating subtask:", error);
					toast.error("Error creating subtask");
				} else {
					setNewSubtaskTitle("");
					fetchSubtasks(); // Fetch subtasks after creating a new one
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
		if (subtasks.length > 0) {
			setIsDeleteModalOpen(true);
		} else {
			handleDeleteTask();
		}
	};

	return (
		<div className="p-6 flex flex-col md:flex-row">
			<div
				className={`w-full md:w-2 h-2 md:h-auto md:mr-4 mb-4 md:mb-0 ${
					task.priority === "low"
						? "bg-green-500"
						: task.priority === "medium"
						? "bg-orange-500"
						: "bg-red-500"
				}`}
			></div>
			<div className="flex-1">
				{isEditing ? (
					<div>
						<div className="mb-4">
							<label className="block text-gray-700 font-bold mb-2">
								Title
							</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 font-bold mb-2">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 font-bold mb-2">
								Due Date
							</label>
							<input
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 font-bold mb-2">
								Priority
							</label>
							<select
								value={priority}
								onChange={(e) => setPriority(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
							</select>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 font-bold mb-2">
								Status
							</label>
							<select
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="To Do">To Do</option>
								<option value="In Progress">In Progress</option>
								<option value="Done">Done</option>
							</select>
						</div>
						<div className="flex justify-end space-x-2">
							<button
								onClick={updateTask}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Update
							</button>
							<button
								onClick={() => setIsEditing(false)}
								className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<div>
						<h3 className="text-xl font-bold mb-2">{title}</h3>
						<p className="text-gray-700 mb-2">{description}</p>

						{/* Due Date */}
						<p className="text-gray-600 mb-2">
							<span className="font-semibold">Due Date:</span>{" "}
							<span className="font-medium">{dueDate}</span>
						</p>

						{/* Priority */}
						<p className="text-gray-600 mb-2">
							<span className="font-semibold">Priority:</span>
							<span
								className={`font-medium ml-2 capitalize ${
									priority === "low"
										? "text-green-600"
										: priority === "medium"
										? "text-orange-600"
										: "text-red-600"
								}`}
							>
								{priority}
							</span>
						</p>

						{/* Status */}
						<p className="text-gray-600 mb-2">
							<span className="font-semibold">Status:</span>{" "}
							<span className="font-medium">{status}</span>
						</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setIsEditing(true)}
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
						<div className="mt-4">
							<div className="flex items-center">
								<input
									type="text"
									value={newSubtaskTitle}
									onChange={(e) => setNewSubtaskTitle(e.target.value)}
									onKeyDown={handleQuickCreateSubtask}
									placeholder="Quick create subtask"
									className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<button
									onClick={handleOpenSubtaskModal}
									className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									+
								</button>
							</div>
						</div>
						<SubtaskList
							taskId={task.id}
							fetchTasks={fetchTasks}
							subtasks={subtasks}
							fetchSubtasks={fetchSubtasks}
							setSubtasks={setSubtasks} // Ensure this is passed down to SubtaskList
						/>
					</div>
				)}
				<SubtaskModal
					isOpen={isSubtaskModalOpen}
					onClose={handleCloseSubtaskModal}
					parentTaskId={task.id}
					fetchTasks={fetchTasks}
					fetchSubtasks={fetchSubtasks} // Pass fetchSubtasks to SubtaskModal
				/>
				{isDeleteModalOpen && (
					<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
						<div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
							<h2 className="text-xl font-bold mb-4">Delete Task</h2>
							<p>
								Deleting this task will also remove all associated subtasks. Are
								you sure you want to continue?
							</p>
							<div className="flex justify-end space-x-2 mt-4">
								<button
									onClick={() => setIsDeleteModalOpen(false)}
									className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
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
		</div>
	);
};

export default TaskDetail;
