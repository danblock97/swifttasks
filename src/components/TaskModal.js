import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import CategoryInput from "./CategoryInput";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";

const TaskModal = ({ isOpen, onClose, fetchTasks, task }) => {
	const [taskData, setTaskData] = useState({
		title: "",
		description: "",
		due_date: "",
		priority: "low",
		status: "To Do",
		categories: [],
		recurrence_type: "none", // New state for recurrence type
		recurrence_custom_interval: null, // New state for custom recurrence interval
	});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (task) {
			setTaskData({
				title: task.title,
				description: task.description,
				due_date: task.due_date,
				priority: task.priority,
				status: task.status ? formatStatus(task.status) : "To Do",
				categories: task.categories || [],
				recurrence_type: task.recurrence_type || "none", // Set recurrence type
				recurrence_custom_interval: task.recurrence_custom_interval || null, // Set custom interval
			});
		} else {
			setTaskData({
				title: "",
				description: "",
				due_date: "",
				priority: "low",
				status: "To Do",
				categories: [],
				recurrence_type: "none", // Default recurrence type
				recurrence_custom_interval: null, // Default custom interval
			});
		}
	}, [task]);

	const formatStatus = (status) => {
		switch (status) {
			case "to_do":
				return "To Do";
			case "in_progress":
				return "In Progress";
			case "done":
				return "Done";
			default:
				return status;
		}
	};

	const reverseFormatStatus = (status) => {
		switch (status) {
			case "To Do":
				return "to_do";
			case "In Progress":
				return "in_progress";
			case "Done":
				return "done";
			default:
				return status;
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTaskData((prevTask) => ({ ...prevTask, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		let error;
		let newDueDate = taskData.due_date;
		let newStatus = taskData.status;

		// Only reset the status to "To Do" if the task is recurring
		if (
			reverseFormatStatus(taskData.status) === "done" &&
			taskData.recurrence_type !== "none"
		) {
			const currentDate = new Date(taskData.due_date);

			if (taskData.recurrence_type === "daily") {
				currentDate.setDate(currentDate.getDate() + 1);
			} else if (taskData.recurrence_type === "weekly") {
				currentDate.setDate(currentDate.getDate() + 7);
			} else if (taskData.recurrence_type === "monthly") {
				currentDate.setMonth(currentDate.getMonth() + 1);
			} else if (
				taskData.recurrence_type === "custom" &&
				taskData.recurrence_custom_interval
			) {
				currentDate.setDate(
					currentDate.getDate() + taskData.recurrence_custom_interval
				);
			}

			// Convert new date to YYYY-MM-DD format
			newDueDate = currentDate.toISOString().split("T")[0];

			// Reset the status to "To Do" only for recurring tasks
			newStatus = "To Do";
		}

		// Update or insert the task with the new due date and status
		if (task) {
			({ error } = await supabase
				.from("tasks")
				.update({
					title: taskData.title,
					description: taskData.description,
					due_date: newDueDate,
					priority: taskData.priority,
					status: reverseFormatStatus(newStatus),
					categories: taskData.categories,
					recurrence_type: taskData.recurrence_type,
					recurrence_custom_interval: taskData.recurrence_custom_interval,
				})
				.eq("id", task.id));
		} else {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("User not authenticated");
				return;
			}

			({ error } = await supabase.from("tasks").insert([
				{
					...taskData,
					due_date: newDueDate,
					status: reverseFormatStatus(newStatus),
					user_id: user.id,
				},
			]));
		}

		if (error) {
			console.error("Error saving task:", error);
			toast.error("Error saving task");
		} else {
			toast.success(`Task ${task ? "updated" : "created"} successfully`);
			onClose();
			setIsLoading(true);
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{isLoading && <Loading />}
			<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
				<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
					<h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-300">
						{task ? "Edit Task" : "Create New Task"}
					</h2>
					<form onSubmit={handleSubmit} className="mb-4">
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Title
							</label>
							<input
								type="text"
								name="title"
								value={taskData.title}
								onChange={handleInputChange}
								placeholder="Title"
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								required
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Description
							</label>
							<textarea
								name="description"
								value={taskData.description}
								onChange={handleInputChange}
								placeholder="Description"
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Due Date
							</label>
							<input
								type="date"
								name="due_date"
								value={taskData.due_date}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Priority
							</label>
							<select
								name="priority"
								value={taskData.priority}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
							</select>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Status
							</label>
							<select
								name="status"
								value={taskData.status}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							>
								<option value="To Do">To Do</option>
								<option value="In Progress">In Progress</option>
								<option value="Done">Done</option>
							</select>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Categories
							</label>
							<CategoryInput
								categories={taskData.categories}
								setCategories={(categories) =>
									setTaskData((prev) => ({ ...prev, categories }))
								}
							/>
						</div>
						{/* Recurrence Options */}
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Recurrence
							</label>
							<select
								name="recurrence_type"
								value={taskData.recurrence_type}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							>
								<option value="none">None</option>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
								<option value="custom">Custom</option>
							</select>
						</div>
						{taskData.recurrence_type === "custom" && (
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Custom Interval (Days)
								</label>
								<input
									type="number"
									name="recurrence_custom_interval"
									value={taskData.recurrence_custom_interval || ""}
									onChange={handleInputChange}
									placeholder="Enter number of days"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								/>
							</div>
						)}
						<div className="flex justify-end space-x-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-800"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
							>
								{task ? "Update" : "Create"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default TaskModal;
