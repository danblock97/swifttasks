import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import CategoryInput from "./CategoryInput";

const SubtaskModal = ({
	isOpen,
	onClose,
	subtask,
	parentTaskId,
	fetchSubtasks,
}) => {
	const [subtaskData, setSubtaskData] = useState({
		title: "",
		description: "",
		due_date: "",
		priority: "low",
		status: "To Do",
		categories: [],
		recurrence_type: "none", // New state for recurrence type
		recurrence_custom_interval: null, // New state for custom recurrence interval
	});

	useEffect(() => {
		if (subtask) {
			setSubtaskData({
				title: subtask.title,
				description: subtask.description,
				due_date: subtask.due_date,
				priority: subtask.priority,
				status: subtask.status ? formatStatus(subtask.status) : "To Do",
				categories: subtask.categories || [],
				recurrence_type: subtask.recurrence_type || "none", // Set recurrence type
				recurrence_custom_interval: subtask.recurrence_custom_interval || null, // Set custom interval
			});
		} else {
			setSubtaskData({
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
	}, [subtask]);

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
		setSubtaskData((prevSubtask) => ({ ...prevSubtask, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		let newDueDate = subtaskData.due_date;
		let newStatus = subtaskData.status;

		// Only reset the status to "To Do" if the subtask is recurring
		if (
			reverseFormatStatus(subtaskData.status) === "done" &&
			subtaskData.recurrence_type !== "none"
		) {
			const currentDate = new Date(subtaskData.due_date);

			if (subtaskData.recurrence_type === "daily") {
				currentDate.setDate(currentDate.getDate() + 1);
			} else if (subtaskData.recurrence_type === "weekly") {
				currentDate.setDate(currentDate.getDate() + 7);
			} else if (subtaskData.recurrence_type === "monthly") {
				currentDate.setMonth(currentDate.getMonth() + 1);
			} else if (
				subtaskData.recurrence_type === "custom" &&
				subtaskData.recurrence_custom_interval
			) {
				currentDate.setDate(
					currentDate.getDate() + subtaskData.recurrence_custom_interval
				);
			}

			// Convert new date to YYYY-MM-DD format
			newDueDate = currentDate.toISOString().split("T")[0];

			// Reset the status to "To Do" only for recurring subtasks
			newStatus = "To Do";
		}

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) {
			console.error("Error fetching user:", authError);
			toast.error("Error fetching user");
			return;
		}

		if (!user) {
			toast.error("User not authenticated");
			return;
		}

		const subtaskPayload = {
			title: subtaskData.title,
			description: subtaskData.description,
			due_date: newDueDate,
			priority: subtaskData.priority,
			status: reverseFormatStatus(newStatus),
			parent_task_id: parentTaskId,
			user_id: user.id,
			categories: subtaskData.categories,
			recurrence_type: subtaskData.recurrence_type,
			recurrence_custom_interval: subtaskData.recurrence_custom_interval,
		};

		let error;
		if (subtask) {
			({ error } = await supabase
				.from("subtasks")
				.update(subtaskPayload)
				.eq("id", subtask.id));
		} else {
			({ error } = await supabase.from("subtasks").insert([subtaskPayload]));
		}

		if (error) {
			console.error("Error saving subtask:", error);
			toast.error("Error saving subtask");
		} else {
			onClose();
			fetchSubtasks();
			toast.success(`Subtask ${subtask ? "updated" : "created"} successfully`);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-300">
					{subtask ? "Edit Subtask" : "Create New Subtask"}
				</h2>
				<form onSubmit={handleSubmit} className="mb-4">
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Title
						</label>
						<input
							type="text"
							name="title"
							value={subtaskData.title}
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
							value={subtaskData.description}
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
							value={subtaskData.due_date}
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
							value={subtaskData.priority}
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
							value={subtaskData.status}
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
							categories={subtaskData.categories}
							setCategories={(categories) =>
								setSubtaskData((prev) => ({ ...prev, categories }))
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
							value={subtaskData.recurrence_type}
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
					{subtaskData.recurrence_type === "custom" && (
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Custom Interval (Days)
							</label>
							<input
								type="number"
								name="recurrence_custom_interval"
								value={subtaskData.recurrence_custom_interval || ""}
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
							{subtask ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SubtaskModal;
